"use client"

import { useState } from "react"
import Link from "next/link"
import SpotMiniMapWrapper from "@/components/SpotMiniMapWrapper"
import { DUMMY_PLACE_LISTS } from "@/lib/client/dummySpots"

const DUMMY_MY_PLACE_LISTS = [
  {
    id: "group-new-osaka",
    name: "大阪の観光地7選",
    description: "最近登録された大阪の観光スポット",
    spotsCount: 4,
    createdAt: "2026-04-09",
  },
  {
    id: "group-popular-kyoto",
    name: "京都の人気スポット",
    description: "おすすめの京都観光スポット",
    spotsCount: 3,
    createdAt: "2026-04-08",
  },
  {
    id: "group-ranking-gourmet",
    name: "グルメスポットランキング",
    description: "人気のあるグルメスポット",
    spotsCount: 2,
    createdAt: "2026-04-07",
  },
]

export default function MyPlaceLists() {
  const [placeLists, setPlaceLists] = useState(DUMMY_MY_PLACE_LISTS)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function deletePlaceList(id: string) {
    setPlaceLists((prev) => prev.filter((p) => p.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/favorites"
          className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          aria-label="マイライブラリに戻る"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">登録したプレイスリスト</h1>
        <span className="ml-auto text-sm text-zinc-400 dark:text-zinc-500">{placeLists.length} 件</span>
      </div>

      {placeLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-600">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <p className="text-sm mt-3">プレイスリストがありません</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {placeLists.map((placeList) => {
            const spots = DUMMY_PLACE_LISTS.find((p) => p.id === placeList.id)?.spots ?? []
            const locations = spots.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng }))

            return (
              <li key={placeList.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                {deletingId === placeList.id ? (
                  <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 flex items-center justify-between gap-3">
                    <p className="text-xs text-red-500 flex-1">「{placeList.name}」を削除しますか？</p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => deletePlaceList(placeList.id)}
                        className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg"
                      >
                        削除
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="border border-zinc-200 dark:border-zinc-700 text-xs px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 地図サムネイル */}
                    <Link href={`/placelists/${placeList.id}`} className="block relative h-36 w-full bg-zinc-200 dark:bg-zinc-800">
                      {locations.length > 0 ? (
                        <SpotMiniMapWrapper locations={locations} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400">地図なし</div>
                      )}
                    </Link>

                    {/* テキスト情報 */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <Link href={`/placelists/${placeList.id}`} className="flex-1 min-w-0 group">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {placeList.name}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                          スポット {placeList.spotsCount}件 · {placeList.createdAt}
                        </p>
                        <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5 truncate">{placeList.description}</p>
                      </Link>
                      <button
                        onClick={() => setDeletingId(placeList.id)}
                        className="ml-3 p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                        aria-label={`${placeList.name}を削除`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
