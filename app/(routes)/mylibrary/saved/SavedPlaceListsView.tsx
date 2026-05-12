"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import SpotMiniMapWrapper from "@/components/SpotMiniMapWrapper"
import type { SavedPlaceList } from "@/lib/server/saves"
import { togglePlaceListSaveAction } from "@/app/actions/saves"

type Props = {
  initialPlaceLists: SavedPlaceList[]
}

export default function SavedPlaceListsView({ initialPlaceLists }: Props) {
  const router = useRouter()
  const [placeLists, setPlaceLists] = useState(initialPlaceLists)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleUnsave(id: string) {
    const snapshot = placeLists
    setPlaceLists((prev) => prev.filter((p) => p.id !== id))
    setPendingId(id)
    startTransition(async () => {
      const result = await togglePlaceListSaveAction(id)
      setPendingId(null)
      if (!result.ok) {
        setPlaceLists(snapshot)
        if (result.reason === "unauthenticated") {
          router.push("/login")
        } else {
          alert(result.message ?? "保存解除に失敗しました")
        }
      }
    })
  }

  if (placeLists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-600">
        <p className="text-sm">保存したプレイスリストがありません</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {placeLists.map((placeList) => {
        const locations = placeList.spots.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng }))

        return (
          <div
            key={placeList.id}
            className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow border border-zinc-200 dark:border-zinc-800 flex flex-col"
          >
            <div className="h-32 w-full relative z-0">
              {locations.length > 0 ? (
                <SpotMiniMapWrapper locations={locations} />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800">地図なし</div>
              )}
            </div>

            <div className="flex items-center p-4 gap-3">
              <Link
                href={`/placelists/${placeList.id}`}
                className="flex-1 min-w-0 group hover:opacity-80 transition"
              >
                <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {placeList.name}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 line-clamp-1">
                  {placeList.description}
                </p>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-2 font-medium">
                  📍 {placeList.spots.length}件のスポット · 保存日: {placeList.savedAt.slice(0, 10)}
                </p>
              </Link>
              <button
                onClick={() => handleUnsave(placeList.id)}
                disabled={pendingId === placeList.id}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-500 underline disabled:opacity-50 shrink-0"
              >
                保存解除
              </button>
              <Link href={`/placelists/${placeList.id}`} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors shrink-0">
                <ChevronRight className="w-5 h-5 text-zinc-500 dark:text-white" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
