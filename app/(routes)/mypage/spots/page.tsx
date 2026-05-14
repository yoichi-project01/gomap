import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronLeft } from "lucide-react"
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
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/mypage"
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
          aria-label="マイページに戻る"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-700 dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">登録したスポット</h1>
        <span className="ml-auto text-sm text-zinc-400 dark:text-zinc-500">{spots.length} 件</span>
      </div>

      <MySpotsView initialSpots={spots} />
    </div>
  )
}
