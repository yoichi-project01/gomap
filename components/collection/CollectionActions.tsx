"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, Heart, Map as MapIcon, Share2 } from "lucide-react"
import { togglePlaceListLikeAction } from "@/app/actions/likes"
import { togglePlaceListSaveAction } from "@/app/actions/saves"

type Props = {
  placeListId: string
  initialLiked: boolean
  initialSaved: boolean
  initialLikesCount: number
  initialSavesCount: number
  mapAnchorId: string
  name?: string
}

const FEEDBACK_DURATION = 2000

export default function CollectionActions({
  placeListId,
  initialLiked,
  initialSaved,
  initialLikesCount,
  initialSavesCount,
  mapAnchorId,
  name,
}: Props) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [saved, setSaved] = useState(initialSaved)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [savesCount, setSavesCount] = useState(initialSavesCount)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isLikePending, startLike] = useTransition()
  const [isSavePending, startSave] = useTransition()

  function flash(message: string) {
    setFeedback(message)
    window.setTimeout(() => setFeedback((prev) => (prev === message ? null : prev)), FEEDBACK_DURATION)
  }

  async function handleShare() {
    const url = window.location.href
    const shareData: ShareData = { title: name, text: name, url }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      flash("URL をコピーしました")
    } catch {
      flash("共有に失敗しました")
    }
  }

  function scrollToMap() {
    const target = document.getElementById(mapAnchorId)
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleLike() {
    const next = !liked
    setLiked(next)
    setLikesCount((c) => c + (next ? 1 : -1))
    startLike(async () => {
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

  function handleSave() {
    const next = !saved
    setSaved(next)
    setSavesCount((c) => c + (next ? 1 : -1))
    startSave(async () => {
      const result = await togglePlaceListSaveAction(placeListId)
      if (!result.ok) {
        setSaved(!next)
        setSavesCount((c) => c + (next ? -1 : 1))
        if (result.reason === "unauthenticated") {
          router.push("/login")
        } else {
          flash(result.message ?? "操作に失敗しました")
        }
        return
      }
      flash(next ? "保存しました" : "保存を解除しました")
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
        disabled={isLikePending}
        aria-label={liked ? "いいねを取り消す" : "いいねする"}
        aria-pressed={liked}
        className={`inline-flex items-center gap-1 transition disabled:opacity-50 ${
          liked ? "text-red-500 hover:text-red-400" : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100"
        }`}
      >
        <Heart className="w-7 h-7" fill={liked ? "currentColor" : "none"} />
        <span className="text-xs font-bold">{likesCount}</span>
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSavePending}
        aria-label={saved ? "保存を解除する" : "保存する"}
        aria-pressed={saved}
        className={`inline-flex items-center gap-1 transition disabled:opacity-50 ${
          saved ? "text-green-400 hover:text-green-300" : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100"
        }`}
      >
        <Bookmark className="w-7 h-7" fill={saved ? "currentColor" : "none"} />
        <span className="text-xs font-bold">{savesCount}</span>
      </button>
      <button
        type="button"
        onClick={handleShare}
        aria-label="共有"
        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 transition"
      >
        <Share2 className="w-7 h-7" />
      </button>
      {feedback && (
        <span className="text-xs text-zinc-400 ml-1" role="status">
          {feedback}
        </span>
      )}
    </div>
  )
}
