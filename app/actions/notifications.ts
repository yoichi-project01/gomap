"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"

export async function markAllNotificationsReadAction(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  revalidatePath("/notifications")
  revalidatePath("/")
}
