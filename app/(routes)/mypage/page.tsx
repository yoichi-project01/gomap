import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"
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

  return <MyPageClient user={myPageUser} />
}
