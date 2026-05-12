"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Heart, Map as MapIcon, MoreVertical } from "lucide-react"
import { togglePlaceListLikeAction } from "@/app/actions/likes"

type Props = {
  placeListId: string
  initialLiked: boolean
  initialLikesCount: number
  mapAnchorId: string
}

const FEEDBACK_DURATION = 2000

export default function CollectionActions({
  placeListId,
  initialLiked,
  initialLikesCount,
  mapAnchorId,
}: Props) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function flash(message: string) {
    setFeedback(message)
    window.setTimeout(() => setFeedback((prev) => (prev === message ? null : prev)), FEEDBACK_DURATION)
  }

  function scrollToMap() {
    const target = document.getElementById(mapAnchorId)
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleLike() {
    const next = !liked
    setLiked(next)
    setLikesCount((c) => c + (next ? 1 : -1))
    startTransition(async () => {
      const result = await togglePlaceListLikeAction(placeListId)
      if (!result.ok) {
        setLiked(!next)
        setLikesCount((c) => c + (next ? -1 : 1))
        if (result.reason === "unauthenticated") {
          router.push("/login")
        } else {
          flash(result.message ?? "操作に失敗しました")
        }
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-6 px-4 py-2 mb-6">
      <button
        type="button"
        onClick={scrollToMap}
        aria-label="地図を表示"
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-black"
      >
        <MapIcon className="w-6 h-6 fill-black" />
      </button>
      <button
        type="button"
        onClick={handleLike}
        disabled={isPending}
        aria-label={liked ? "いいねを取り消す" : "いいねする"}
        aria-pressed={liked}
        className={`inline-flex items-center gap-1 transition disabled:opacity-50 ${
          liked ? "text-red-500 hover:text-red-400" : "text-zinc-400 hover:text-white"
        }`}
      >
        <Heart className="w-7 h-7" fill={liked ? "currentColor" : "none"} />
        <span className="text-xs font-bold">{likesCount}</span>
      </button>
      <button
        type="button"
        aria-label="メニュー (準備中)"
        title="準備中"
        className="text-zinc-600 cursor-not-allowed"
        disabled
      >
        <MoreVertical className="w-7 h-7" />
      </button>
      {feedback && (
        <span className="text-xs text-zinc-400 ml-1" role="status">
          {feedback}
        </span>
      )}
    </div>
  )
}
