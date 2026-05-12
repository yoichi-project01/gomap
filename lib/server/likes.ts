// プレイスリストいいねのサーバー側データアクセス

import { createSupabaseServerClient } from "./supabaseAuth"

export async function isPlaceListLiked(placeListId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from("place_list_likes")
    .select("place_list_id")
    .eq("place_list_id", placeListId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) throw error
  return data !== null
}
