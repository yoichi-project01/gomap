"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import SpotMiniMapWrapper from "@/components/SpotMiniMapWrapper"
import type { LikedPlaceList } from "@/lib/server/likes"
import { togglePlaceListLikeAction } from "@/app/actions/likes"

type Props = {
  initialPlaceLists: LikedPlaceList[]
}

export default function LikedPlaceListsView({ initialPlaceLists }: Props) {
  const router = useRouter()
  const [placeLists, setPlaceLists] = useState(initialPlaceLists)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleUnlike(id: string) {
    const snapshot = placeLists
    setPlaceLists((prev) => prev.filter((p) => p.id !== id))
    setPendingId(id)
    startTransition(async () => {
      const result = await togglePlaceListLikeAction(id)
      setPendingId(null)
      if (!result.ok) {
        setPlaceLists(snapshot)
        if (result.reason === "unauthenticated") {
          router.push("/login")
        } else {
          alert(result.message ?? "いいね解除に失敗しました")
        }
      }
    })
  }

  if (placeLists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-600">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <p className="text-sm mt-3">いいねしたプレイスリストがありません</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {placeLists.map((placeList) => {
        const locations = placeList.spots.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng }))

        return (
          <li key={placeList.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <Link href={`/placelists/${placeList.id}`} className="block relative h-36 w-full bg-zinc-200 dark:bg-zinc-800">
              {locations.length > 0 ? (
                <SpotMiniMapWrapper locations={locations} />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400">地図なし</div>
              )}
            </Link>

            <div className="flex items-start justify-between px-4 py-3 gap-3">
              <Link href={`/placelists/${placeList.id}`} className="flex-1 min-w-0 group">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  {placeList.name}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  スポット {placeList.spots.length}件 · いいね日: {placeList.likedAt.slice(0, 10)}
                </p>
              </Link>
              <button
                onClick={() => handleUnlike(placeList.id)}
                disabled={pendingId === placeList.id}
                className="flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors shrink-0 mt-0.5 disabled:opacity-50"
                aria-label="いいねを取り消す"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-xs">{placeList.likes ?? 0}</span>
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
