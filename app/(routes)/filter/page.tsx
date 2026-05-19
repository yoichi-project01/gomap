"use client"

// 絞り込みページ
// URL: /filter

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Navigation, ArrowDownUp, Tag } from "lucide-react"
import SelectField from "@/components/ui/SelectField"
import MultiSelectField from "@/components/ui/MultiSelectField"

const DEFAULT_PREFECTURE = ""
const DEFAULT_DISTANCE    = ""
const DEFAULT_ORDER       = "登録が新しい順"

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

const PRESET_CATEGORIES = ["グルメ", "観光", "カフェ", "自然", "ショッピング", "その他"]
const DISTANCES = ["500m 以内", "1km 以内", "3km 以内", "10km 以内"]
const ORDERS    = ["登録が新しい順", "登録が古い順", "距離が近い順"]

function FilterForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [prefecture, setPrefecture] = useState(
    searchParams.get("pref") ?? DEFAULT_PREFECTURE
  )
  const [selectedCats, setSelectedCats] = useState<string[]>(
    searchParams.get("cat") ? searchParams.get("cat")!.split(",") : []
  )
  const [distance, setDistance] = useState(searchParams.get("distance") ?? DEFAULT_DISTANCE)
  const [order, setOrder]       = useState(
    searchParams.get("order") ?? DEFAULT_ORDER
  )
  const [query, setQuery]       = useState(searchParams.get("q") ?? "")

  const initialLat = searchParams.get("lat")
  const initialLng = searchParams.get("lng")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: Number(initialLat), lng: Number(initialLng) } : null
  )
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied" | "error">(
    initialLat && initialLng ? "ok" : "idle"
  )

  function requestLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("error")
      return
    }
    setGeoStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoStatus("ok")
      },
      (err) => {
        setGeoStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error")
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  function handleReset() {
    setPrefecture(DEFAULT_PREFECTURE)
    setSelectedCats([])
    setDistance(DEFAULT_DISTANCE)
    setOrder(DEFAULT_ORDER)
    setQuery("")
    setCoords(null)
    setGeoStatus("idle")
  }

  function handleSubmit() {
    const params = new URLSearchParams()
    if (prefecture)              params.set("pref", prefecture)
    if (selectedCats.length)     params.set("cat", selectedCats.join(","))
    if (distance) {
      params.set("distance", distance)
      if (coords) {
        params.set("lat", coords.lat.toFixed(6))
        params.set("lng", coords.lng.toFixed(6))
      }
    }
    if (order !== DEFAULT_ORDER) params.set("order", order)
    if (query.trim())            params.set("q", query.trim())
    const qs = params.toString()
    router.push(`/?${qs || "show=all"}`)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 検索バー */}
      <input
        type="text"
        placeholder="プレイスリストを検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-full bg-zinc-800 border border-zinc-700 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-green-500 transition-colors"
      />

      {/* ヘッダ */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">絞り込み</h1>
        <button
          onClick={handleReset}
          className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
        >
          すべてリセット
        </button>
      </div>

      {/* 都道府県 */}
      <div>
        <h2 className="text-sm font-bold text-zinc-300 mb-2">都道府県</h2>
        <SelectField
          icon={<MapPin className="w-3.5 h-3.5" />}
          ariaLabel="都道府県を選択"
          value={prefecture || null}
          options={PREFECTURES}
          onChange={(v) => setPrefecture(v ?? "")}
          placeholder="指定なし"
        />
      </div>

      {/* カテゴリ (複数選択プルダウン) */}
      <div>
        <h2 className="text-sm font-bold text-zinc-300 mb-2">カテゴリ</h2>
        <MultiSelectField
          icon={<Tag className="w-3.5 h-3.5" />}
          ariaLabel="カテゴリを選択 (複数可)"
          values={selectedCats}
          options={PRESET_CATEGORIES}
          onChange={setSelectedCats}
          placeholder="指定なし"
        />
      </div>

      {/* 距離 */}
      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <h2 className="text-sm font-bold text-zinc-300">距離</h2>
          <button
            type="button"
            onClick={requestLocation}
            disabled={geoStatus === "loading"}
            className="text-[11px] px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 disabled:opacity-50 transition-colors"
          >
            {geoStatus === "loading" ? "取得中…" : coords ? "現在地を再取得" : "現在地を取得"}
          </button>
        </div>
        <SelectField
          icon={<Navigation className="w-3.5 h-3.5" />}
          ariaLabel="距離を選択"
          value={distance || null}
          options={DISTANCES}
          onChange={(v) => setDistance(v ?? "")}
          placeholder="指定なし"
        />
        <p className="text-[11px] text-zinc-500 mt-1.5">
          {geoStatus === "ok" && coords && `現在地: ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`}
          {geoStatus === "denied" && "位置情報の利用が拒否されています"}
          {geoStatus === "error"  && "現在地を取得できませんでした"}
          {geoStatus === "idle"   && "距離で絞り込むには現在地が必要です"}
        </p>
      </div>

      {/* 並び順 */}
      <div>
        <h2 className="text-sm font-bold text-zinc-300 mb-2">並び順</h2>
        <SelectField
          icon={<ArrowDownUp className="w-3.5 h-3.5" />}
          ariaLabel="並び順を選択"
          value={order}
          options={ORDERS}
          onChange={(v) => v && setOrder(v)}
          clearable={false}
        />
      </div>

      {/* 適用ボタン */}
      <button
        onClick={handleSubmit}
        className="mt-2 w-full bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-3 rounded-full transition-colors"
      >
        この条件で絞り込む
      </button>
    </div>
  )
}

export default function FilterPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-8">
        <Suspense fallback={<p className="text-sm text-zinc-400 py-8 text-center">読み込み中...</p>}>
          <FilterForm />
        </Suspense>
      </div>
    </div>
  )
}
