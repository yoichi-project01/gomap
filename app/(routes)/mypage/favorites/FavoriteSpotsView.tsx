"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, MapPin, X } from "lucide-react"
import type { FavoriteSpot } from "@/lib/server/favorites"
import { toggleFavoriteAction } from "@/app/actions/favorites"

type Props = {
  initialSpots: FavoriteSpot[]
}

const TOAST_DURATION_MS = 4000

export default function FavoriteSpotsView({ initialSpots }: Props) {
  const router = useRouter()
  const [spots, setSpots] = useState(initialSpots)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!error) return
    const t = window.setTimeout(() => setError(null), TOAST_DURATION_MS)
    return () => window.clearTimeout(t)
  }, [error])

  function handleUnfavorite(id: string) {
    const snapshot = spots
    setSpots((prev) => prev.filter((s) => s.id !== id))
    setPendingId(id)
    setError(null)
    startTransition(async () => {
      const result = await toggleFavoriteAction(id)
      setPendingId(null)
      if (!result.ok) {
        setSpots(snapshot)
        if (result.reason === "unauthenticated") {
          router.push("/login")
        } else {
          setError(result.message ?? "お気に入り解除に失敗しました")
        }
      }
    })
  }

  if (spots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-600">
        <Heart className="w-10 h-10" />
        <p className="text-sm mt-3">お気に入りスポットがありません</p>
      </div>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {spots.map((spot) => (
          <li key={spot.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <Link href={`/spots/${spot.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                <div
                  className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 bg-cover bg-center flex items-center justify-center"
                  style={spot.coverImageUrl ? { backgroundImage: `url(${spot.coverImageUrl})` } : undefined}
                >
                  {!spot.coverImageUrl && <MapPin className="w-5 h-5 text-zinc-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                    {spot.name}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                    {[spot.prefecture, spot.category].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleUnfavorite(spot.id)}
                disabled={pendingId === spot.id}
                className="text-red-400 hover:text-red-600 transition-colors shrink-0 disabled:opacity-50"
                aria-label="お気に入りから外す"
              >
                <Heart className="w-5 h-5" fill="currentColor" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {error && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md flex items-start gap-3 bg-red-500 text-white text-sm px-4 py-3 rounded-2xl shadow-lg"
        >
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            aria-label="閉じる"
            className="shrink-0 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  )
}
