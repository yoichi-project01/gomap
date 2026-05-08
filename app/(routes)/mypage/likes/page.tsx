"use client"

import { useState } from "react"
import Link from "next/link"
import SpotMiniMapWrapper from "@/components/SpotMiniMapWrapper"
import { DUMMY_PLACE_LISTS } from "@/lib/client/dummySpots"

const DUMMY_LIKED_PLACE_LISTS = [
  { id: "group-new-osaka",       name: "大阪観光名所7選",         spotsCount: 4, likes: 12, likedAt: "2026-04-10" },
  { id: "group-popular-kyoto",   name: "京都の人気スポット",       spotsCount: 3, likes: 8,  likedAt: "2026-04-09" },
  { id: "group-ranking-gourmet", name: "グルメスポットランキング", spotsCount: 2, likes: 20, likedAt: "2026-04-07" },
]

export default function LikedPlaceLists() {
  const [placeLists, setPlaceLists] = useState(DUMMY_LIKED_PLACE_LISTS)

  function unlike(id: string) {
    setPlaceLists((prev) => prev.filter((p) => p.id !== id))
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
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">いいねしたプレイスリスト</h1>
        <span className="ml-auto text-sm text-zinc-400 dark:text-zinc-500">{placeLists.length} 件</span>
      </div>

      {placeLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-600">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="text-sm mt-3">いいねしたプレイスリストがありません</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {placeLists.map((placeList) => {
            const spots = DUMMY_PLACE_LISTS.find((p) => p.id === placeList.id)?.spots ?? []
            const locations = spots.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng }))

            return (
              <li key={placeList.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                {/* 地図サムネイル */}
                <Link href={`/placelists/${placeList.id}`} className="block relative h-36 w-full bg-zinc-200 dark:bg-zinc-800">
                  {locations.length > 0 ? (
                    <SpotMiniMapWrapper locations={locations} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400">地図なし</div>
                  )}
                </Link>

                {/* テキスト情報 */}
                <div className="flex items-start justify-between px-4 py-3 gap-3">
                  <Link href={`/placelists/${placeList.id}`} className="flex-1 min-w-0 group">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                      {placeList.name}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      スポット {placeList.spotsCount}件 · いいね日: {placeList.likedAt}
                    </p>
                  </Link>
                  <button
                    onClick={() => unlike(placeList.id)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors shrink-0 mt-0.5"
                    aria-label="いいねを取り消す"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="text-xs">{placeList.likes}</span>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
