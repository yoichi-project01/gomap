"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import SpotMiniMapWrapper from "@/components/SpotMiniMapWrapper"
import type { LikedSpot } from "@/lib/server/spotLikes"
import { toggleSpotLikeAction } from "@/app/actions/spotLikes"
import { formatJstDate } from "@/lib/format"

type Props = {
  initialSpots: LikedSpot[]
}

export default function LikedSpotsView({ initialSpots }: Props) {
  const router = useRouter()
  const [spots, setSpots] = useState(initialSpots)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleUnlike(id: string) {
    const snapshot = spots
    setSpots((prev) => prev.filter((s) => s.id !== id))
    setPendingId(id)
    startTransition(async () => {
      const result = await toggleSpotLikeAction(id)
      setPendingId(null)
      if (!result.ok) {
        setSpots(snapshot)
        if (result.reason === "unauthenticated") {
          router.push("/login")
        } else {
          alert(result.message ?? "いいね解除に失敗しました")
        }
      }
    })
  }

  if (spots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-600">
        <Heart className="w-10 h-10" />
        <p className="text-sm mt-3">いいねしたスポットがありません</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {spots.map((spot) => (
        <li key={spot.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <Link href={`/spots/${spot.id}`} className="flex h-36 w-full">
            {spot.coverImageUrl && (
              <div className="w-1/5 h-full shrink-0 bg-black flex items-center justify-center overflow-hidden">
                <img src={spot.coverImageUrl} alt={spot.name} className="w-full h-full object-contain" />
              </div>
            )}
            <div className={`${spot.coverImageUrl ? "w-4/5" : "w-full"} h-full relative bg-zinc-200 dark:bg-zinc-800`}>
              <SpotMiniMapWrapper locations={[{ id: spot.id, name: spot.name, lat: spot.lat, lng: spot.lng }]} />
            </div>
          </Link>

          <div className="flex items-start justify-between px-4 py-3 gap-3">
            <Link href={`/spots/${spot.id}`} className="flex-1 min-w-0 group">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {spot.name}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                {[spot.prefecture, `いいね日: ${formatJstDate(spot.likedAt)}`].filter(Boolean).join(" · ")}
              </p>
            </Link>
            <button
              onClick={() => handleUnlike(spot.id)}
              disabled={pendingId === spot.id}
              className="flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors shrink-0 mt-0.5 disabled:opacity-50"
              aria-label="いいねを取り消す"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-xs">{spot.likesCount ?? 0}</span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
