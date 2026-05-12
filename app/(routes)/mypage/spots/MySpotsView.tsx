"use client"

import { useState } from "react"
import Link from "next/link"
import type { Spot } from "@/types/spot"
import { deleteSpot as deleteSpotApi } from "@/lib/client/spots"

type Props = {
  initialSpots: Spot[]
}

export default function MySpotsView({ initialSpots }: Props) {
  const [spots, setSpots] = useState(initialSpots)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete(id: string) {
    setIsDeleting(true)
    try {
      await deleteSpotApi(id)
      setSpots((prev) => prev.filter((s) => s.id !== id))
      setDeletingId(null)
    } catch (err) {
      console.error(err)
      alert("削除に失敗しました")
    } finally {
      setIsDeleting(false)
    }
  }

  if (spots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-600">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <p className="text-sm mt-3">スポットがありません</p>
        <Link
          href="/spots/create"
          className="mt-4 text-xs font-bold text-green-600 dark:text-green-400 underline"
        >
          スポットを登録する
        </Link>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {spots.map((spot) => (
        <li key={spot.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
          {deletingId === spot.id ? (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 flex items-center justify-between gap-3">
              <p className="text-xs text-red-500 flex-1">「{spot.name}」を削除しますか？</p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleDelete(spot.id)}
                  disabled={isDeleting}
                  className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  {isDeleting ? "削除中..." : "削除"}
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="border border-zinc-200 dark:border-zinc-700 text-xs px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3">
              <Link href={`/spots/${spot.id}`} className="flex-1 min-w-0 group">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  {spot.name}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {[spot.prefecture, spot.category, spot.createdAt?.slice(0, 10)].filter(Boolean).join(" · ")}
                </p>
              </Link>
              <button
                onClick={() => setDeletingId(spot.id)}
                className="ml-3 p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors shrink-0"
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
  )
}
