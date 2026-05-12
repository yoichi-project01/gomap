"use client"

import { useState } from "react"
import Link from "next/link"
import { Pencil } from "lucide-react"
import SpotMiniMapWrapper from "@/components/SpotMiniMapWrapper"
import type { PlaceList } from "@/types/spot"
import { deletePlaceList } from "@/lib/client/placeLists"

type Props = {
  initialPlaceLists: PlaceList[]
}

export default function MyPlaceListsView({ initialPlaceLists }: Props) {
  const [placeLists, setPlaceLists] = useState(initialPlaceLists)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete(id: string) {
    setIsDeleting(true)
    try {
      await deletePlaceList(id)
      setPlaceLists((prev) => prev.filter((p) => p.id !== id))
      setDeletingId(null)
    } catch (err) {
      console.error(err)
      alert("削除に失敗しました")
    } finally {
      setIsDeleting(false)
    }
  }

  if (placeLists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-600">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <p className="text-sm mt-3">プレイスリストがありません</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {placeLists.map((placeList) => {
        const locations = placeList.spots.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng }))

        return (
          <li key={placeList.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {deletingId === placeList.id ? (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 flex items-center justify-between gap-3">
                <p className="text-xs text-red-500 flex-1">「{placeList.name}」を削除しますか？</p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(placeList.id)}
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
              <>
                <Link href={`/placelists/${placeList.id}`} className="block relative h-36 w-full bg-zinc-200 dark:bg-zinc-800">
                  {locations.length > 0 ? (
                    <SpotMiniMapWrapper locations={locations} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400">地図なし</div>
                  )}
                </Link>

                <div className="flex items-center justify-between px-4 py-3">
                  <Link href={`/placelists/${placeList.id}`} className="flex-1 min-w-0 group">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                      {placeList.name}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      スポット {placeList.spots.length}件
                      {placeList.createdAt ? ` · ${placeList.createdAt.slice(0, 10)}` : ""}
                    </p>
                    <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5 truncate">{placeList.description}</p>
                  </Link>
                  <div className="ml-3 flex items-center gap-1 shrink-0">
                  <Link
                    href={`/placelists/${placeList.id}/edit`}
                    className="p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-green-500 transition-colors"
                    aria-label={`${placeList.name}を編集`}
                  >
                    <Pencil className="w-[15px] h-[15px]" />
                  </Link>
                  <button
                    onClick={() => setDeletingId(placeList.id)}
                    className="p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors"
                    aria-label={`${placeList.name}を削除`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                  </button>
                  </div>
                </div>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
