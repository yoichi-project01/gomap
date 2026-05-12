// お気に入りスポットのサーバー側データアクセス
// RLS でユーザー本人のみが読み書きできる前提

import { createSupabaseServerClient } from "./supabaseAuth"

export async function isSpotFavorited(spotId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from("favorites")
    .select("spot_id")
    .eq("spot_id", spotId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) throw error
  return data !== null
}

export async function listFavoriteSpotIds(): Promise<string[]> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("favorites")
    .select("spot_id")
    .eq("user_id", user.id)

  if (error) throw error
  return (data ?? []).map((row) => row.spot_id as string)
}
