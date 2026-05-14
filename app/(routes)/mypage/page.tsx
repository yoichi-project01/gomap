import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"
import { getDisplayName } from "@/lib/server/profiles"
import { getUserStats, type UserStats } from "@/lib/server/stats"
import pkg from "@/package.json"
import MyPageClient, { type MyPageUser } from "./MyPageClient"

const JST_DATE = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

function formatCreatedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return JST_DATE.format(d)
}

export default async function MyPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const email = user.email ?? ""
  const displayName = await getDisplayName(supabase, user.id)

  const myPageUser: MyPageUser = {
    email,
    createdAt: formatCreatedAt(user.created_at),
    initialName: displayName || email.split("@")[0] || "ユーザー",
  }

  let stats: UserStats
  let statsError = false
  try {
    stats = await getUserStats(supabase, user.id)
  } catch (e) {
    console.error("[mypage] getUserStats failed", e)
    stats = { placeListsCount: 0, favoritesCount: 0, likesReceived: 0 }
    statsError = true
  }

  return (
    <MyPageClient
      user={myPageUser}
      stats={stats}
      statsError={statsError}
      appVersion={pkg.version}
    />
  )
}
