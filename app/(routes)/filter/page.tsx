"use client"

// 絞り込みページ
// URL: /filter

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

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

function AccordionSection({
  title,
  summary,
  defaultOpen = true,
  children,
}: {
  title: string
  summary: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</span>
        <div className="flex items-center gap-2 min-w-0">
          {!open && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[120px]">{summary}</span>
          )}
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className={`shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800">
          {children}
        </div>
      )}
    </div>
  )
}

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

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
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

  const prefSummary  = prefecture || "指定なし"
  const catSummary   = selectedCats.length ? selectedCats.join(", ") : "指定なし"
  const distSummary  = distance || "指定なし"
  const orderSummary = order

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="プレイスリストを検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">絞り込み</h1>
        <button
          onClick={handleReset}
          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors px-2 py-1"
        >
          すべてリセット
        </button>
      </div>

      <AccordionSection title="都道府県" summary={prefSummary}>
        <div className="pt-3">
          <select
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors cursor-pointer"
          >
            <option value="">指定なし</option>
            {PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>
      </AccordionSection>

      <AccordionSection title="カテゴリ" summary={catSummary}>
        <div className="pt-3">
          <div className="flex flex-wrap gap-2">
            {PRESET_CATEGORIES.map((cat) => {
              const isSelected = selectedCats.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                    isSelected
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500"
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="距離" summary={distSummary} defaultOpen={false}>
        <div className="pt-3 mb-3 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={requestLocation}
            disabled={geoStatus === "loading"}
            className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500 disabled:opacity-50 transition-colors"
          >
            {geoStatus === "loading" ? "取得中…" : coords ? "現在地を再取得" : "現在地を取得"}
          </button>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {geoStatus === "ok" && coords && `取得済み (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`}
            {geoStatus === "denied" && "位置情報の利用が拒否されています"}
            {geoStatus === "error"  && "現在地を取得できませんでした"}
            {geoStatus === "idle"   && "距離で絞り込むには現在地が必要です"}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {DISTANCES.map((dist) => (
            <label
              key={dist}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                distance === dist
                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800"
                  : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <input
                type="radio"
                name="distance"
                value={dist}
                checked={distance === dist}
                onChange={() => setDistance(dist)}
                className="accent-zinc-900 dark:accent-zinc-100"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-200">{dist}</span>
            </label>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="並び順" summary={orderSummary} defaultOpen={false}>
        <div className="pt-3 flex flex-col gap-2">
          {ORDERS.map((o) => (
            <label
              key={o}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                order === o
                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800"
                  : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <input
                type="radio"
                name="order"
                value={o}
                checked={order === o}
                onChange={() => setOrder(o)}
                className="accent-zinc-900 dark:accent-zinc-100"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-200">{o}</span>
            </label>
          ))}
        </div>
      </AccordionSection>

      <button
        onClick={handleSubmit}
        className="mt-2 w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium px-4 py-3 rounded-2xl hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
      >
        この条件で絞り込む
      </button>
    </div>
  )
}

export default function FilterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Suspense fallback={<p className="text-sm text-zinc-400 py-8 text-center">読み込み中...</p>}>
          <FilterForm />
        </Suspense>
      </div>
    </div>
  )
}
