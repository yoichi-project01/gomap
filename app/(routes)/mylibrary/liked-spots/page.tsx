import Link from "next/link"
import { Heart } from "lucide-react"
import { listLikedSpots } from "@/lib/server/spotLikes"
import LikedSpotsView from "./LikedSpotsView"

export const dynamic = "force-dynamic"

export default async function LikedSpotsPage() {
  const spots = await listLikedSpots()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-40 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/mylibrary"
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3"
          aria-label="マイライブラリに戻る"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <Heart className="w-6 h-6 text-red-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">いいねしたスポット</h1>
        <span className="ml-auto text-sm text-zinc-400 dark:text-zinc-500">{spots.length} 件</span>
      </header>

      <main className="px-4 pt-6">
        <LikedSpotsView initialSpots={spots} />
      </main>
    </div>
  )
}
