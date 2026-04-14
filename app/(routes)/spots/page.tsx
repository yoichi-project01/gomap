"use client"

// スポット一覧ページ
// URL: /spots
// TODO: getSpots() に差し替える・いいね状態は Supabase の likes テーブルで管理する

import { useState } from "react"
import Link from "next/link"
import type { Spot } from "@/types/spot"

type SpotWithLike = Spot & {
  likes: number
  liked: boolean
}

// ダミーデータ
// TODO: getSpots() に差し替える
const INITIAL_SPOTS: SpotWithLike[] = [
  {
    id: "1",
    name: "東京タワー",
    description: "東京の有名な観光スポット",
    lat: 35.6586, lng: 139.7454,
    createdAt: "2026-04-08", createdBy: "user-1",
    likes: 12, liked: false,
  },
  {
    id: "2",
    name: "渋谷スクランブル交差点",
    description: "世界で最も有名な交差点のひとつ",
    lat: 35.6595, lng: 139.7004,
    createdAt: "2026-04-08", createdBy: "user-2",
    likes: 8, liked: true,
  },
  {
    id: "3",
    name: "新宿御苑",
    description: "都心にある広大な公園",
    lat: 35.6851, lng: 139.7100,
    createdAt: "2026-04-08", createdBy: "user-1",
    likes: 5, liked: false,
  },
]

export default function SpotsPage() {
  const [spots, setSpots] = useState(INITIAL_SPOTS)

  function toggleLike(id: string) {
    // TODO: Supabase の likes テーブルに insert / delete する
    setSpots((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 }
          : s
      )
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-900">スポット一覧</h1>
        {/* TODO: スポット登録モーダルを開く */}
        <button className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors">
          + 登録する
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {spots.map((spot) => (
          <li key={spot.id}>
            <div className="bg-white border border-zinc-100 rounded-2xl p-4 hover:border-zinc-300 transition-colors">
              {/* カード本体（詳細ページへ） */}
              <Link href={`/spots/${spot.id}`} className="block">
                <p className="font-semibold text-zinc-900">{spot.name}</p>
                {spot.description && (
                  <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{spot.description}</p>
                )}
              </Link>

              {/* フッター（登録日 + いいねボタン） */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50">
                <p className="text-xs text-zinc-400">登録日: {spot.createdAt}</p>

                {/* いいねボタン */}
                <button
                  onClick={() => toggleLike(spot.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    spot.liked ? "text-red-500" : "text-zinc-300 hover:text-red-400"
                  }`}
                  aria-label={spot.liked ? "いいねを取り消す" : "いいねする"}
                >
                  <svg
                    width="18" height="18" viewBox="0 0 24 24"
                    fill={spot.liked ? "currentColor" : "none"}
                    stroke="currentColor" strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="text-xs font-medium">{spot.likes}</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
