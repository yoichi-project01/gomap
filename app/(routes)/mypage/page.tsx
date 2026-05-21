import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"
import { getProfile } from "@/lib/server/profiles"
import { getUserStats, type UserStats } from "@/lib/server/stats"
import { formatJstDate } from "@/lib/format"
import pkg from "@/package.json"
import MyPageClient, { type MyPageUser } from "./MyPageClient"

const ZERO_STATS: UserStats = { placeListsCount: 0, favoritesCount: 0, likesReceived: 0 }

// PostgrestError / Error は非列挙プロパティが多く console.error で素直に出すと {} になる。
// 主要フィールドを取り出して可視化する。
function describeError(err: unknown): Record<string, unknown> {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>
    return {
      message: e.message,
      code:    e.code,
      details: e.details,
      hint:    e.hint,
      name:    e.name,
    }
  }
  return { value: err }
}

export default async function MyPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 表示名取得と統計集計を並列実行。
  // 統計の失敗はユーザーに通知して 0 表示にフォールバックするが、
  // 表示名の失敗は致命的でないので Promise.allSettled で分離。
  const [profileRes, statsRes] = await Promise.allSettled([
    getProfile(supabase, user.id),
    getUserStats(supabase, user.id),
  ])

  if (profileRes.status === "rejected") {
    console.error("[mypage] getProfile failed", describeError(profileRes.reason))
  }
  if (statsRes.status === "rejected") {
    console.error("[mypage] getUserStats failed", describeError(statsRes.reason))
  }

  const profile = profileRes.status === "fulfilled" ? profileRes.value : null
  const stats = statsRes.status === "fulfilled" ? statsRes.value : ZERO_STATS
  const statsError = statsRes.status === "rejected"

  // メールアドレスのローカル部はフォールバックに使わない(他人から見たときに
  // メアドが漏れるため)。display_name が未設定なら「匿名ユーザー」固定。
  const myPageUser: MyPageUser = {
    email: user.email ?? "",
    createdAt: formatJstDate(user.created_at),
    initialName: profile?.displayName || "匿名ユーザー",
    avatarUrl: profile?.avatarUrl ?? null,
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
