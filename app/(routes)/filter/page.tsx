"use client"

// 絞り込みページ
// URL: /filter
// 選択した条件を URL パラメータに乗せてホームへ遷移 → app/page.tsx でフィルタリング

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// ── 定数：追加・変更はここだけ触る ────────────────────────────────
const DEFAULT_PREFECTURE = "大阪府"
const DEFAULT_DISTANCE    = "3km 以内"
const DEFAULT_ORDER       = "登録が新しい順"

const PREFECTURES = [
  "北海道",
  "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

// プリセットカテゴリ（削除不可。追加はここに書くだけ）
const PRESET_CATEGORIES = ["グルメ", "観光", "カフェ", "自然", "ショッピング", "その他"]

const DISTANCES = ["500m 以内", "1km 以内", "3km 以内", "10km 以内"]
const ORDERS    = ["登録が新しい順", "登録が古い順", "距離が近い順"]
// ─────────────────────────────────────────────────────────────────

// ── アコーディオンセクション ──────────────────────────────────────
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
    <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-zinc-800">{title}</span>
        <div className="flex items-center gap-2 min-w-0">
          {/* 閉じているとき選択中の値をサマリー表示 */}
          {!open && (
            <span className="text-xs text-zinc-400 truncate max-w-[120px]">{summary}</span>
          )}
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className={`shrink-0 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-zinc-50">
          {children}
        </div>
      )}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────

// ── メインフォーム ────────────────────────────────────────────────
function FilterForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // URL パラメータから初期値を復元（フィルターページに戻ったとき選択が残る）
  const [prefecture, setPrefecture] = useState(
    searchParams.get("pref") ?? DEFAULT_PREFECTURE
  )
  const [selectedCats, setSelectedCats] = useState<string[]>(
    searchParams.get("cat") ? searchParams.get("cat")!.split(",") : []
  )
  const [distance, setDistance] = useState(DEFAULT_DISTANCE)
  const [order, setOrder]       = useState(
    searchParams.get("order") ?? DEFAULT_ORDER
  )
  const [query, setQuery]       = useState(searchParams.get("q") ?? "")

  // カテゴリ追加
  const [customCats, setCustomCats] = useState<string[]>([])
  const [newCat, setNewCat]         = useState("")
  const allCategories = [...PRESET_CATEGORIES, ...customCats]

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  function addCat() {
    const name = newCat.trim()
    if (!name || allCategories.includes(name)) return
    setCustomCats((prev) => [...prev, name])
    setNewCat("")
  }

  function removeCat(cat: string) {
    setCustomCats((prev) => prev.filter((c) => c !== cat))
    setSelectedCats((prev) => prev.filter((c) => c !== cat))
  }

  function handleReset() {
    setPrefecture(DEFAULT_PREFECTURE)
    setSelectedCats([])
    setDistance(DEFAULT_DISTANCE)
    setOrder(DEFAULT_ORDER)
    setCustomCats([])
    setQuery("")
  }

  function handleSubmit() {
    const params = new URLSearchParams()
    if (prefecture)            params.set("pref", prefecture)
    if (selectedCats.length)   params.set("cat", selectedCats.join(","))
    if (order !== DEFAULT_ORDER) params.set("order", order)
    if (query.trim())           params.set("q", query.trim())
    router.push(`/?${params.toString()}`)
  }

  // サマリーテキスト（アコーディオンを閉じたとき表示）
  const prefSummary = prefecture || "指定なし"
  const catSummary  = selectedCats.length ? selectedCats.join(", ") : "指定なし"
  const distSummary = distance
  const orderSummary = order

  return (
    <div>
      {/* 検索バー */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="スポットを検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-700 outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-zinc-900">絞り込み</h1>
        <button
          onClick={handleReset}
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-1"
        >
          すべてリセット
        </button>
      </div>

      {/* 都道府県 */}
      <AccordionSection title="都道府県" summary={prefSummary}>
        <div className="pt-3">
          <select
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-700 outline-none focus:border-zinc-400 transition-colors cursor-pointer"
          >
            <option value="">指定なし</option>
            {PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>
      </AccordionSection>

      {/* カテゴリ */}
      <AccordionSection title="カテゴリ" summary={catSummary}>
        <div className="pt-3 space-y-3">
          {/* タグ一覧 */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const isCustom   = customCats.includes(cat)
              const isSelected = selectedCats.includes(cat)
              return (
                <div key={cat} className="relative flex items-center">
                  <button
                    onClick={() => toggleCat(cat)}
                    className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                      isSelected
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                    } ${isCustom ? "pr-7" : ""}`}
                  >
                    {cat}
                  </button>
                  {/* カスタムカテゴリのみ削除ボタン */}
                  {isCustom && (
                    <button
                      onClick={() => removeCat(cat)}
                      className="absolute right-1.5 text-zinc-400 hover:text-zinc-700 text-xs leading-none"
                      aria-label={`${cat}を削除`}
                    >
                      ×
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* カテゴリ追加 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCat()}
              placeholder="カテゴリを追加..."
              maxLength={20}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-300"
            />
            <button
              onClick={addCat}
              disabled={!newCat.trim() || allCategories.includes(newCat.trim())}
              className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-xl disabled:opacity-30 transition-opacity shrink-0"
            >
              追加
            </button>
          </div>
        </div>
      </AccordionSection>

      {/* 距離 */}
      <AccordionSection title="距離" summary={distSummary} defaultOpen={false}>
        <div className="pt-3 flex flex-col gap-2">
          {DISTANCES.map((dist) => (
            <label
              key={dist}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                distance === dist
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-100 hover:border-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="distance"
                value={dist}
                checked={distance === dist}
                onChange={() => setDistance(dist)}
                className="accent-zinc-900"
              />
              <span className="text-sm text-zinc-700">{dist}</span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* 並び順 */}
      <AccordionSection title="並び順" summary={orderSummary} defaultOpen={false}>
        <div className="pt-3 flex flex-col gap-2">
          {ORDERS.map((o) => (
            <label
              key={o}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                order === o
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-100 hover:border-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="order"
                value={o}
                checked={order === o}
                onChange={() => setOrder(o)}
                className="accent-zinc-900"
              />
              <span className="text-sm text-zinc-700">{o}</span>
            </label>
          ))}
        </div>
      </AccordionSection>

      <button
        onClick={handleSubmit}
        className="mt-2 w-full bg-zinc-900 text-white text-sm font-medium px-4 py-3 rounded-2xl hover:bg-zinc-700 transition-colors"
      >
        この条件で絞り込む
      </button>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────

export default function FilterPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400 py-8 text-center">読み込み中...</p>}>
      <FilterForm />
    </Suspense>
  )
}
