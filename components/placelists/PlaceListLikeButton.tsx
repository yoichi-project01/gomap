"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { togglePlaceListLikeAction } from "@/app/actions/likes"

type Props = {
  placeListId: string
  initialLiked: boolean
  initialLikes: number
}

export default function PlaceListLikeButton({ placeListId, initialLiked, initialLikes }: Props) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [likes, setLikes] = useState(initialLikes)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const next = !liked
    setLiked(next)
    setLikes((c) => c + (next ? 1 : -1))
    startTransition(async () => {
      const result = await togglePlaceListLikeAction(placeListId)
      if (!result.ok) {
        setLiked(!next)
        setLikes((c) => c + (next ? -1 : 1))
        if (result.reason === "unauthenticated") {
          router.push("/login")
        } else {
          alert(result.message ?? "操作に失敗しました")
        }
        return
      }
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={liked ? "いいねを取り消す" : "いいねする"}
      aria-pressed={liked}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition disabled:opacity-50 ${
        liked
          ? "bg-red-100 dark:bg-red-950/40 text-red-500 hover:bg-red-200 dark:hover:bg-red-950/60"
          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
      <span className="text-sm font-bold">{likes}</span>
    </button>
  )
}
