"use client"

// 登録スポット一覧ページ
// URL: /mypage/spots
// TODO: Supabase から createdBy = ログインユーザーID で取得する

import { useState } from "react"
import Link from "next/link"

const DUMMY_MY_SPOTS = [
  { id: "1", name: "大阪城",  category: "観光",  prefecture: "大阪府", createdAt: "2026-04-09" },
  { id: "2", name: "道頓堀",  category: "グルメ", prefecture: "大阪府", createdAt: "2026-04-08" },
  { id: "4", name: "USJ",     category: "その他", prefecture: "大阪府", createdAt: "2026-04-06" },
]

export default function MySpots() {
  const [spots, setSpots] = useState(DUMMY_MY_SPOTS)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function deleteSpot(id: string) {
    setSpots((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
  }

  return (
    <div>
      {/* ヘッダー */}
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
        <h1 className="text-xl font-bold text-zinc-900">登録したスポット</h1>
        <span className="ml-auto text-sm text-zinc-400">{spots.length} 件</span>
      </div>

      {spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-300">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-sm mt-3">スポットがありません</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {spots.map((spot) => (
            <li key={spot.id} className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
              {deletingId === spot.id ? (
                /* 削除確認 */
                <div className="px-4 py-3 bg-red-50 flex items-center justify-between gap-3">
                  <p className="text-xs text-red-500 flex-1">「{spot.name}」を削除しますか？</p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => deleteSpot(spot.id)}
                      className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg"
                    >
                      削除
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="border border-zinc-200 text-xs px-3 py-1.5 rounded-lg text-zinc-600"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{spot.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {spot.prefecture} · {spot.category} · {spot.createdAt}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeletingId(spot.id)}
                    className="ml-3 p-1.5 text-zinc-300 hover:text-red-400 transition-colors shrink-0"
                    aria-label={`${spot.name}を削除`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
