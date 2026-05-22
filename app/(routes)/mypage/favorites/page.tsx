import { redirect } from "next/navigation"
import { Heart } from "lucide-react"
import BackButton from "@/components/ui/BackButton"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"
import { listFavoriteSpots } from "@/lib/server/favorites"
import FavoriteSpotsView from "./FavoriteSpotsView"

export const dynamic = "force-dynamic"

export default async function FavoriteSpotsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/mypage/favorites")

  const spots = await listFavoriteSpots()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <BackButton
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3"
          iconClassName="w-6 h-6 text-zinc-700 dark:text-white"
        />
        <Heart className="w-6 h-6 text-red-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">お気に入りスポット</h1>
        <span className="ml-auto text-sm text-zinc-400 dark:text-zinc-500">{spots.length} 件</span>
      </header>

      <main className="px-4 pt-6">
        <FavoriteSpotsView initialSpots={spots} />
      </main>
    </div>
  )
}
