"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Trash2, AlertTriangle } from "lucide-react"
import type { Spot } from "@/types/spot"
import { deleteSpot as deleteSpotApi } from "@/lib/client/spots"

type Props = {
  initialSpots: Spot[]
}

function DeleteSpotDialog({
  spot, onClose, onConfirm, isDeleting, error,
}: {
  spot: Spot
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
  error: string | null
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !isDeleting) onClose() }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, isDeleting])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-spot-title"
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={() => { if (!isDeleting) onClose() }}
    >
      <div
        className="w-full sm:max-w-sm bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="delete-spot-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              スポットを削除しますか？
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed break-all">
              「{spot.name}」を削除します。<br />
              このスポットを含むプレイスリストからも自動的に取り除かれます。
            </p>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-3" role="alert">{error}</p>
        )}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 border border-zinc-200 dark:border-zinc-700 text-sm py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-xl disabled:opacity-50"
          >
            {isDeleting ? "削除中…" : "削除する"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MySpotsView({ initialSpots }: Props) {
  const [spots, setSpots] = useState(initialSpots)
  const [target, setTarget] = useState<Spot | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!target) return
    setIsDeleting(true)
    setError(null)
    try {
      await deleteSpotApi(target.id)
      setSpots((prev) => prev.filter((s) => s.id !== target.id))
      setTarget(null)
    } catch (err) {
      console.error(err)
      setError("削除に失敗しました。時間を置いてお試しください。")
    } finally {
      setIsDeleting(false)
    }
  }

  if (spots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-600">
        <MapPin className="w-10 h-10" />
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
    <>
      <ul className="flex flex-col gap-2">
        {spots.map((spot) => (
          <li key={spot.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
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
                onClick={() => { setError(null); setTarget(spot) }}
                className="ml-3 p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                aria-label={`${spot.name}を削除`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {target && (
        <DeleteSpotDialog
          spot={target}
          isDeleting={isDeleting}
          error={error}
          onClose={() => { if (!isDeleting) setTarget(null) }}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
