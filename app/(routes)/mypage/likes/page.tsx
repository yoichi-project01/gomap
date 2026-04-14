"use client"

// いいねしたスポット一覧
// URL: /mypage/likes
// TODO: Supabase の likes テーブルから user_id = ログインユーザーで取得する

import { useState } from "react"
import Link from "next/link"

const DUMMY_LIKED_SPOTS = [
  { id: "2", name: "渋谷スクランブル交差点", category: "観光", prefecture: "東京都", likes: 8,  likedAt: "2026-04-10" },
  { id: "1", name: "東京タワー",             category: "観光", prefecture: "東京都", likes: 12, likedAt: "2026-04-09" },
  { id: "5", name: "金閣寺",                 category: "観光", prefecture: "京都府", likes: 20, likedAt: "2026-04-07" },
]

export default function LikedSpots() {
  const [spots, setSpots] = useState(DUMMY_LIKED_SPOTS)

  function unlike(id: string) {
    // TODO: Supabase の likes テーブルから delete する
    setSpots((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/mypage"
          className="text-zinc-400 hover:text-zinc-700 transition-colors"
          aria-label="マイページに戻る"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">いいねしたスポット</h1>
        <span className="ml-auto text-sm text-zinc-400">{spots.length} 件</span>
      </div>

      {spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-300">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="text-sm mt-3">いいねしたスポットがありません</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {spots.map((spot) => (
            <li key={spot.id} className="bg-white border border-zinc-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/spots/${spot.id}`} className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{spot.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {spot.prefecture} · {spot.category}
                  </p>
                </Link>

                {/* いいね取り消しボタン */}
                <button
                  onClick={() => unlike(spot.id)}
                  className="flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors shrink-0"
                  aria-label="いいねを取り消す"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="text-xs">{spot.likes}</span>
                </button>
              </div>

              <p className="text-xs text-zinc-300 mt-2">いいね日: {spot.likedAt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
