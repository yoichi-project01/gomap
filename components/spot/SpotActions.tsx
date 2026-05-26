"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Heart, Navigation, Share2 } from "lucide-react"
import { toggleSpotLikeAction } from "@/app/actions/spotLikes"

type Props = {
  spotId: string
  name: string
  lat: number
  lng: number
  initialLiked: boolean
  likeCount: number
}

const FEEDBACK_DURATION = 2000

export default function SpotActions({ spotId, name, lat, lng, initialLiked, likeCount }: Props) {
  const router = useRouter()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [liked, setLiked] = useState(initialLiked)
  const [displayLikeCount, setDisplayLikeCount] = useState(likeCount)
  const [isLikePending, startLikeTransition] = useTransition()

  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  function flash(message: string) {
    setFeedback(message)
    window.setTimeout(() => setFeedback((prev) => (prev === message ? null : prev)), FEEDBACK_DURATION)
  }

  async function handleShare() {
    const url = window.location.href
    const data: ShareData = { title: name, text: name, url }

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(data)
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

  function handleLike() {
    const next = !liked
    setLiked(next)
    setDisplayLikeCount((c) => c + (next ? 1 : -1))
    startLikeTransition(async () => {
      const result = await toggleSpotLikeAction(spotId)
      if (!result.ok) {
        setLiked(!next)
        setDisplayLikeCount((c) => c + (next ? -1 : 1))
        if (result.reason === "unauthenticated") {
          router.push("/login")
        } else {
          flash(result.message ?? "操作に失敗しました")
        }
      }
    })
  }

  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <a
        href={navUrl}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="ナビを開始"
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-black"
      >
        <Navigation className="w-6 h-6 fill-black" />
      </a>

      <button
        type="button"
        onClick={handleLike}
        disabled={isLikePending}
        aria-label={liked ? "いいねを取り消す" : "いいね"}
        aria-pressed={liked}
        className={`flex items-center gap-1 transition disabled:opacity-50 ${
          liked
            ? "text-red-500 hover:text-red-400"
            : "text-zinc-400 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-white"
        }`}
      >
        <Heart className="w-8 h-8" fill={liked ? "currentColor" : "none"} />
        {displayLikeCount > 0 && (
          <span className="text-sm font-semibold">{displayLikeCount}</span>
        )}
      </button>

      <button
        type="button"
        onClick={handleShare}
        aria-label="共有"
        className="text-zinc-400 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-white transition"
      >
        <Share2 className="w-7 h-7" />
      </button>

      {feedback && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1" role="status">
          {feedback}
        </span>
      )}
    </div>
  )
}
