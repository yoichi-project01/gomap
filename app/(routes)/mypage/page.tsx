import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"
import { getUserStats, type UserStats } from "@/lib/server/stats"
import MyPageClient, { type MyPageUser } from "./MyPageClient"

export default async function MyPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const metadataName =
    typeof user.user_metadata?.name === "string" ? user.user_metadata.name.trim() : ""
  const email = user.email ?? ""

  const myPageUser: MyPageUser = {
    email,
    createdAt: user.created_at.slice(0, 10),
    initialName: metadataName || email.split("@")[0] || "ユーザー",
  }

  let stats: UserStats
  try {
    stats = await getUserStats(user.id)
  } catch (e) {
    console.error("[mypage] getUserStats failed", e)
    stats = { placeListsCount: 0, favoritesCount: 0, likesReceived: 0 }
  }

  return <MyPageClient user={myPageUser} stats={stats} />
}
