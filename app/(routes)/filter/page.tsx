"use client"

// 絞り込みページ
// URL: /filter

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Navigation, ArrowDownUp, Tag, Sparkles, Globe, Calendar, ListChecks, User, Map as MapIcon, Bookmark, X } from "lucide-react"
import SelectField from "@/components/ui/SelectField"
import MultiSelectField from "@/components/ui/MultiSelectField"
import type { PlaceList, Spot } from "@/types/spot"
import { getPlaceLists } from "@/lib/client/placeLists"
import { filterPlaceLists, type SortOrder, type CreatedSince, type BBox } from "@/lib/filter/placeLists"
import { createSupabaseBrowserClient } from "@/lib/client/supabaseBrowser"
import FilterMapWrapper from "@/components/filter/FilterMapWrapper"
import {
  getFilterPresets,
  createFilterPreset,
  deleteFilterPreset,
  type FilterPreset,
} from "@/lib/client/filterPresets"

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
const ORDERS    = ["登録が新しい順", "登録が古い順", "距離が近い順", "人気順"]

// 公開/非公開: label 表示 → 内部 boolean に変換
const PUB_OPTIONS = ["公開のみ", "非公開のみ"] as const
// 作成日: ラベル → CreatedSince
const SINCE_LABEL: Record<CreatedSince, string> = {
  week:  "今週",
  month: "今月",
  year:  "今年",
}
const SINCE_OPTIONS = Object.values(SINCE_LABEL)
const LABEL_TO_SINCE: Record<string, CreatedSince> = {
  "今週": "week", "今月": "month", "今年": "year",
}
// スポット数: ラベル → 下限数
const MIN_SPOT_LABEL: Record<string, number> = {
  "3件以上": 3, "5件以上": 5, "10件以上": 10,
}
const MIN_SPOT_OPTIONS = Object.keys(MIN_SPOT_LABEL)

// クイックフィルタ: ワンタップで定番の絞り込み条件を適用するプリセット集
type QuickPreset = {
  label: string
  pref?: string
  cats?: string[]
  distance?: string
  requiresGeo?: boolean
}
const QUICK_PRESETS: QuickPreset[] = [
  { label: "週末散策",   cats: ["観光", "自然"] },
  { label: "ご飯探し",   cats: ["グルメ", "カフェ"] },
  { label: "東京観光",   pref: "東京都", cats: ["観光"] },
  { label: "近場 (3km)", distance: "3km 以内", requiresGeo: true },
]

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

  // 追加フィルタの初期値: URL クエリから復元
  const initialPub = searchParams.get("pub")
  const [isPublic, setIsPublic] = useState<boolean | null>(
    initialPub === "1" ? true : initialPub === "0" ? false : null,
  )
  const initialSince = searchParams.get("since") as CreatedSince | null
  const [createdSince, setCreatedSince] = useState<CreatedSince | null>(
    initialSince && ["week", "month", "year"].includes(initialSince) ? initialSince : null,
  )
  const initialMin = searchParams.get("min")
  const [minSpots, setMinSpots] = useState<number | null>(
    initialMin && /^\d+$/.test(initialMin) ? Number(initialMin) : null,
  )
  const [mineOnly, setMineOnly] = useState(searchParams.get("mine") === "1")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // マップ範囲フィルタ
  const initialN = searchParams.get("n"), initialS = searchParams.get("s")
  const initialE = searchParams.get("e"), initialW = searchParams.get("w")
  const initialBBox: BBox | null =
    initialN && initialS && initialE && initialW
      ? { north: Number(initialN), south: Number(initialS), east: Number(initialE), west: Number(initialW) }
      : null
  const [bbox, setBBox] = useState<BBox | null>(initialBBox)
  const [mapEnabled, setMapEnabled] = useState<boolean>(initialBBox !== null)

  // 保存済みプリセット
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [savingPreset, setSavingPreset] = useState(false)
  useEffect(() => {
    if (!currentUserId) return // 未ログインなら取得しない
    getFilterPresets()
      .then(setPresets)
      .catch((err) => {
        // テーブル未作成等で失敗してもページ自体は使えるように、ログだけ出して握りつぶす
        console.warn("プリセット一覧の取得に失敗 (DB マイグレーション未適用?):", err)
      })
  }, [currentUserId])

  // ログイン中ユーザーID取得 (自分のみフィルタ用)
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
  }, [])

  const initialLat = searchParams.get("lat")
  const initialLng = searchParams.get("lng")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: Number(initialLat), lng: Number(initialLng) } : null
  )
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied" | "error">(
    initialLat && initialLng ? "ok" : "idle"
  )

  // 全プレイスリストを 1 回取得 → 現在のフィルタ条件で件数を即時計算 (件数プレビュー)
  const [allPlaceLists, setAllPlaceLists] = useState<PlaceList[] | null>(null)
  useEffect(() => {
    let cancelled = false
    getPlaceLists()
      .then((lists) => { if (!cancelled) setAllPlaceLists(lists) })
      .catch((err) => console.error("件数プレビュー取得失敗", err))
    return () => { cancelled = true }
  }, [])

  // allPlaceLists 内のスポットを重複なく収集 (フィルターマップのマーカー用)
  const allSpots = useMemo<Spot[]>(() => {
    if (!allPlaceLists) return []
    const seen = new Set<string>()
    const result: Spot[] = []
    for (const pl of allPlaceLists) {
      for (const spot of pl.spots) {
        if (!seen.has(spot.id)) {
          seen.add(spot.id)
          result.push(spot)
        }
      }
    }
    return result
  }, [allPlaceLists])

  const matchCount = useMemo(() => {
    if (!allPlaceLists) return null
    return filterPlaceLists(allPlaceLists, {
      pref: prefecture || undefined,
      cats: selectedCats.length ? selectedCats : undefined,
      query: query.trim() || undefined,
      distance: distance || undefined,
      coords,
      order: order as SortOrder,
      isPublic: isPublic ?? undefined,
      createdSince: createdSince ?? undefined,
      minSpots: minSpots ?? undefined,
      mineOnly,
      currentUserId: currentUserId ?? undefined,
      bbox: mapEnabled && bbox ? bbox : undefined,
    }).length
  }, [allPlaceLists, prefecture, selectedCats, distance, order, query, coords, isPublic, createdSince, minSpots, mineOnly, currentUserId, mapEnabled, bbox])

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
    setIsPublic(null)
    setCreatedSince(null)
    setMinSpots(null)
    setMineOnly(false)
    setBBox(null)
    setMapEnabled(false)
  }

  // プリセット適用: 既存フィルタをクリアしてからプリセットの値だけセット
  function applyPreset(p: QuickPreset) {
    setPrefecture(p.pref ?? DEFAULT_PREFECTURE)
    setSelectedCats(p.cats ? [...p.cats] : [])
    setDistance(p.distance ?? DEFAULT_DISTANCE)
    setOrder(DEFAULT_ORDER)
    setQuery("")
    if (p.requiresGeo && !coords) requestLocation()
  }

  // 現在のフィルタ条件を params オブジェクトに集約 (保存・URL 復元用)
  function currentParams(): Record<string, unknown> {
    return {
      pref: prefecture || undefined,
      cats: selectedCats.length ? selectedCats : undefined,
      query: query.trim() || undefined,
      distance: distance || undefined,
      coords,
      order,
      isPublic,
      createdSince,
      minSpots,
      mineOnly,
      bbox: mapEnabled ? bbox : undefined,
    }
  }

  // 保存済みプリセットの内容を現在のフォーム state に展開
  function applyStoredPreset(p: FilterPreset) {
    const d = p.params as Record<string, unknown>
    setPrefecture((d.pref as string) ?? DEFAULT_PREFECTURE)
    setSelectedCats(Array.isArray(d.cats) ? (d.cats as string[]) : [])
    setQuery((d.query as string) ?? "")
    setDistance((d.distance as string) ?? DEFAULT_DISTANCE)
    const c = d.coords as { lat: number; lng: number } | null | undefined
    setCoords(c ?? null)
    setGeoStatus(c ? "ok" : "idle")
    setOrder((d.order as string) ?? DEFAULT_ORDER)
    setIsPublic(typeof d.isPublic === "boolean" ? d.isPublic : null)
    setCreatedSince(
      d.createdSince === "week" || d.createdSince === "month" || d.createdSince === "year"
        ? (d.createdSince as CreatedSince)
        : null,
    )
    setMinSpots(typeof d.minSpots === "number" ? d.minSpots : null)
    setMineOnly(d.mineOnly === true)
    const b = d.bbox as BBox | null | undefined
    if (b && typeof b.north === "number") {
      setBBox(b)
      setMapEnabled(true)
    } else {
      setBBox(null)
      setMapEnabled(false)
    }
  }

  async function handleSavePreset() {
    if (!currentUserId) return
    const name = window.prompt("このフィルタの名前を入力してください", "")
    if (!name || !name.trim()) return
    setSavingPreset(true)
    try {
      const created = await createFilterPreset({ name: name.trim(), params: currentParams() })
      setPresets((prev) => [created, ...prev])
    } catch (err) {
      console.error(err)
      alert("プリセットの保存に失敗しました")
    } finally {
      setSavingPreset(false)
    }
  }

  async function handleDeletePreset(id: string) {
    if (!window.confirm("このプリセットを削除しますか?")) return
    try {
      await deleteFilterPreset(id)
      setPresets((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
      alert("プリセットの削除に失敗しました")
    }
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
    if (isPublic !== null)       params.set("pub", isPublic ? "1" : "0")
    if (createdSince)            params.set("since", createdSince)
    if (minSpots)                params.set("min", String(minSpots))
    if (mineOnly)                params.set("mine", "1")
    if (mapEnabled && bbox) {
      params.set("n", bbox.north.toFixed(4))
      params.set("s", bbox.south.toFixed(4))
      params.set("e", bbox.east.toFixed(4))
      params.set("w", bbox.west.toFixed(4))
    }
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
        className="w-full px-4 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-green-500 transition-colors"
      />

      {/* クイックフィルタ (定番条件をワンタップで適用) */}
      <div>
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-green-400" />
          クイックフィルタ
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-200 hover:border-green-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 保存済みプリセット (ログイン中のみ表示。0件のときは非表示) */}
      {currentUserId && presets.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-green-400" />
            保存済みフィルタ
          </h2>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-200"
              >
                <button
                  type="button"
                  onClick={() => applyStoredPreset(p)}
                  className="hover:text-white transition"
                >
                  {p.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePreset(p.id)}
                  aria-label={`${p.name} を削除`}
                  className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-red-400 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ヘッダ */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">絞り込み</h1>
        <button
          onClick={handleReset}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors underline underline-offset-2"
        >
          すべてリセット
        </button>
      </div>

      {/* 都道府県 */}
      <div>
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">都道府県</h2>
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
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">カテゴリ</h2>
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
          <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">距離</h2>
          <button
            type="button"
            onClick={requestLocation}
            disabled={geoStatus === "loading"}
            className="text-[11px] px-2.5 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 disabled:opacity-50 transition-colors"
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

      {/* マップ範囲で絞り込み */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <MapIcon className="w-3.5 h-3.5 text-zinc-400" />
            マップ範囲で絞り込み
          </h2>
          <button
            type="button"
            onClick={() => {
              setMapEnabled((v) => !v)
              if (mapEnabled) setBBox(null)
            }}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              mapEnabled
                ? "bg-green-500 border-green-500 text-black font-bold"
                : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            {mapEnabled ? "ON" : "OFF"}
          </button>
        </div>
        {mapEnabled && (
          <div className="rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <FilterMapWrapper
              initialBBox={initialBBox}
              initialCenter={coords ? [coords.lat, coords.lng] : undefined}
              spots={allSpots}
              onBoundsChange={setBBox}
            />
          </div>
        )}
        {mapEnabled && (
          <p className="text-[11px] text-zinc-500 mt-1.5">
            地図を動かすと、表示中の範囲内にあるスポットを持つプレイスリストだけが対象になります。
          </p>
        )}
      </div>

      {/* 公開/非公開 */}
      <div>
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">公開設定</h2>
        <SelectField
          icon={<Globe className="w-3.5 h-3.5" />}
          ariaLabel="公開状態で絞り込み"
          value={isPublic === true ? "公開のみ" : isPublic === false ? "非公開のみ" : null}
          options={[...PUB_OPTIONS]}
          onChange={(v) => setIsPublic(v === "公開のみ" ? true : v === "非公開のみ" ? false : null)}
          placeholder="指定なし"
        />
      </div>

      {/* 作成日 */}
      <div>
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">作成日</h2>
        <SelectField
          icon={<Calendar className="w-3.5 h-3.5" />}
          ariaLabel="作成日範囲で絞り込み"
          value={createdSince ? SINCE_LABEL[createdSince] : null}
          options={SINCE_OPTIONS}
          onChange={(v) => setCreatedSince(v ? (LABEL_TO_SINCE[v] ?? null) : null)}
          placeholder="指定なし"
        />
      </div>

      {/* スポット数 */}
      <div>
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">スポット数</h2>
        <SelectField
          icon={<ListChecks className="w-3.5 h-3.5" />}
          ariaLabel="スポット数で絞り込み"
          value={minSpots ? `${minSpots}件以上` : null}
          options={MIN_SPOT_OPTIONS}
          onChange={(v) => setMinSpots(v ? (MIN_SPOT_LABEL[v] ?? null) : null)}
          placeholder="指定なし"
        />
      </div>

      {/* 自分のみ (ログイン中のみ表示) */}
      {currentUserId && (
        <div>
          <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">登録者</h2>
          <SelectField
            icon={<User className="w-3.5 h-3.5" />}
            ariaLabel="登録者で絞り込み"
            value={mineOnly ? "自分のみ" : null}
            options={["自分のみ"]}
            onChange={(v) => setMineOnly(v === "自分のみ")}
            placeholder="全員"
          />
        </div>
      )}

      {/* 並び順 */}
      <div>
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">並び順</h2>
        <SelectField
          icon={<ArrowDownUp className="w-3.5 h-3.5" />}
          ariaLabel="並び順を選択"
          value={order}
          options={ORDERS}
          onChange={(v) => v && setOrder(v)}
          clearable={false}
        />
      </div>

      {/* 件数プレビュー + 適用ボタン + プリセット保存ボタン */}
      <div className="mt-2 flex flex-col gap-2 items-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          該当{" "}
          <span className="font-bold text-zinc-900 dark:text-white">
            {matchCount === null ? "..." : matchCount}
          </span>{" "}
          件
        </p>
        <button
          onClick={handleSubmit}
          disabled={matchCount === 0}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-zinc-200 dark:disabled:bg-zinc-700 disabled:text-zinc-400 text-black text-sm font-bold px-4 py-3 rounded-full transition-colors"
        >
          この条件で絞り込む
        </button>
        {currentUserId && (
          <button
            type="button"
            onClick={handleSavePreset}
            disabled={savingPreset}
            className="w-full flex items-center justify-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 text-zinc-700 dark:text-zinc-200 text-xs font-bold px-4 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            {savingPreset ? "保存中..." : "現在の条件を保存"}
          </button>
        )}
      </div>
    </div>
  )
}

export default function FilterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white pb-24">
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-8">
        <Suspense fallback={<p className="text-sm text-zinc-400 py-8 text-center">読み込み中...</p>}>
          <FilterForm />
        </Suspense>
      </div>
    </div>
  )
}
