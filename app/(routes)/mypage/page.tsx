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
  const [displayNameRes, statsRes] = await Promise.allSettled([
    getDisplayName(supabase, user.id),
    getUserStats(supabase, user.id),
  ])

  if (displayNameRes.status === "rejected") {
    console.error("[mypage] getDisplayName failed", describeError(displayNameRes.reason))
  }
  if (statsRes.status === "rejected") {
    console.error("[mypage] getUserStats failed", describeError(statsRes.reason))
  }

  const displayName = displayNameRes.status === "fulfilled" ? displayNameRes.value : null
  const stats = statsRes.status === "fulfilled" ? statsRes.value : ZERO_STATS
  const statsError = statsRes.status === "rejected"

  // メールアドレスのローカル部はフォールバックに使わない(他人から見たときに
  // メアドが漏れるため)。display_name が未設定なら「匿名ユーザー」固定。
  const myPageUser: MyPageUser = {
    email: user.email ?? "",
    createdAt: formatCreatedAt(user.created_at),
    initialName: displayName || "匿名ユーザー",
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
