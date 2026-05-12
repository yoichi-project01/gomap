"use client"

// 絞り込み結果ページ
// URL: /results
// 絞り込み条件に基づいてプレイスリストをフィルタリングして表示

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { placeLists, type PlaceList } from "@/lib/data/placeLists"
import SpotMiniMapWrapper from "@/components/SpotMiniMapWrapper"

// 仮のプレイスリストデータ（placeLists.ts から取得）
const dummyPlaceLists: PlaceList[] = placeLists as PlaceList[]

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URLパラメータから条件を取得
  const pref = searchParams.get("pref")
  const cats = searchParams.get("cat")?.split(",") || []
  const order = searchParams.get("order")
  const query = searchParams.get("q")

  // ローカルの検索クエリ状態
  const [localQuery, setLocalQuery] = useState(query || "")

  // 検索実行
  const performSearch = () => {
    const params = new URLSearchParams()
    if (pref) params.set("pref", pref)
    if (cats.length) params.set("cat", cats.join(","))
    if (order) params.set("order", order)
    if (localQuery.trim()) params.set("q", localQuery.trim())
    router.push(`/results?${params.toString()}`)
  }

  // 絞り込み画面に戻る
  const goToFilter = () => {
    const params = new URLSearchParams()
    if (pref) params.set("pref", pref)
    if (cats.length) params.set("cat", cats.join(","))
    if (order) params.set("order", order)
    if (localQuery.trim()) params.set("q", localQuery.trim())
    router.push(`/filter?${params.toString()}`)
  }

  // 並び順のオプション
  const orders = ["登録が新しい順", "登録が古い順", "距離が近い順"]

  // 並び順を変更
  const changeOrder = () => {
    const currentIndex = orders.indexOf(order || "登録が新しい順")
    const nextIndex = (currentIndex + 1) % orders.length
    const newOrder = orders[nextIndex]
    const params = new URLSearchParams()
    if (pref) params.set("pref", pref)
    if (cats.length) params.set("cat", cats.join(","))
    params.set("order", newOrder)
    if (localQuery.trim()) params.set("q", localQuery.trim())
    router.push(`/results?${params.toString()}`)
  }

  // フィルタリングとソートロジック（仮）
  let filteredPlaceLists: PlaceList[] = dummyPlaceLists.filter(list => {
    if (pref && list.prefecture !== pref) return false
    if (cats.length && !cats.includes(list.category)) return false
    if (query && !list.name.includes(query)) return false
    return true
  })

  // ソート
  if (order === "登録が古い順") {
    filteredPlaceLists = filteredPlaceLists.reverse() // 仮に逆順
  } else if (order === "距離が近い順") {
    // 距離ソート（仮）
    filteredPlaceLists = filteredPlaceLists.sort((a, b) => a.name.localeCompare(b.name)) // 仮
  }
  // デフォルトは新しい順（そのまま）

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pb-24 font-sans">
      {/* ヘッダー */}
      <div className="px-4 py-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
        <h1 className="text-xl font-bold">絞り込み結果</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          {filteredPlaceLists.length}件のプレイスリストが見つかりました
        </p>
      </div>

      {/* 絞り込み条件 */}
      <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        {/* 検索バー */}
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && performSearch()}
            className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none"
            placeholder="プレイスリストを検索..."
          />
          <button
            onClick={performSearch}
            className="px-4 py-2 bg-zinc-800 dark:bg-zinc-600 text-white dark:text-zinc-100 text-sm rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-500 transition-colors"
          >
            検索
          </button>
        </div>

        {/* 選択した条件のタグ */}
        <div className="flex flex-wrap gap-2 items-center">
          {pref && (
            <span className="inline-block px-3 py-1 bg-zinc-300 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100 text-xs rounded-full">
              {pref}
            </span>
          )}
          {cats.map(cat => (
            <span key={cat} className="inline-block px-3 py-1 bg-zinc-300 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100 text-xs rounded-full">
              {cat}
            </span>
          ))}
          {order && order !== "登録が新しい順" && (
            <span className="inline-block px-3 py-1 bg-zinc-300 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100 text-xs rounded-full">
              {order}
            </span>
          )}

          {/* 条件を変更ボタン */}
          <button
            onClick={goToFilter}
            className="ml-auto px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors border border-zinc-300 dark:border-zinc-600"
          >
            条件を変更
          </button>
        </div>

        {/* 条件がない場合のメッセージ */}
        {!pref && cats.length === 0 && !localQuery.trim() && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">すべてのプレイスリスト</p>
        )}
      </div>

      {/* 結果リスト */}
      <main className="px-4 mt-4">
        {filteredPlaceLists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">条件に一致するプレイスリストが見つかりません</p>
          </div>
        ) : (
          <>
            {/* 並び替えボタン */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">並び順: {order || "登録が新しい順"}</span>
              <button
                onClick={changeOrder}
                className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                変更
              </button>
            </div>

            <div className="space-y-4">
              {filteredPlaceLists.map(list => (
                <Link key={list.id} href={`/spots/${list.id}`}>
                  <div className="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700">
                    {/* 小さい地図 */}
                    <div className="h-32 w-full relative z-0">
                      <SpotMiniMapWrapper locations={list.locations} />
                    </div>
                    {/* プレイスリスト情報 */}
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{list.name}</h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{list.category} - {list.prefecture}</p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">{list.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {list.spots.slice(0, 3).map(spot => (
                          <span key={spot} className="inline-block px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs rounded">
                            {spot}
                          </span>
                        ))}
                        {list.spots.length > 3 && (
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">他{list.spots.length - 3}件</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">読み込み中...</div>}>
      <ResultsContent />
    </Suspense>
  )
}