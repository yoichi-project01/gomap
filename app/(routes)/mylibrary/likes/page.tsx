import Link from "next/link"
import { listLikedPlaceLists } from "@/lib/server/likes"
import LikedPlaceListsView from "./LikedPlaceListsView"

export const dynamic = "force-dynamic"

export default async function LikedPlaceListsPage() {
  const placeLists = await listLikedPlaceLists()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/mylibrary"
          className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          aria-label="マイライブラリに戻る"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">いいねしたプレイスリスト</h1>
        <span className="ml-auto text-sm text-zinc-400 dark:text-zinc-500">{placeLists.length} 件</span>
      </div>

      <LikedPlaceListsView initialPlaceLists={placeLists} />
    </div>
  )
}
