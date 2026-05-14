import Link from "next/link"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"
import { listSpotsByCreator } from "@/lib/server/spots"
import MySpotsView from "./MySpotsView"

export const dynamic = "force-dynamic"

export default async function MySpotsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const spots = await listSpotsByCreator(supabase, user.id)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/mypage"
          className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          aria-label="マイページに戻る"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">登録したスポット</h1>
        <span className="ml-auto text-sm text-zinc-400 dark:text-zinc-500">{spots.length} 件</span>
      </div>

      <MySpotsView initialSpots={spots} />
    </div>
  )
}
