// プレイスリストいいねのサーバー側データアクセス

import type { PostgrestError } from "@supabase/supabase-js"
import type { PlaceList } from "@/types/spot"
import { createSupabaseServerClient } from "./supabaseAuth"
import { listPlaceListsByIds } from "./placeLists"

function wrapPostgrestError(prefix: string, error: PostgrestError): Error {
  const parts = [error.message, error.details, error.hint, error.code]
    .filter((s): s is string => typeof s === "string" && s.length > 0)
  const wrapped = new Error(`${prefix}: ${parts.join(" / ")}`)
  console.error(prefix, error)
  return wrapped
}

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

  if (error) throw wrapPostgrestError("isPlaceListLiked", error)
  return data !== null
}

export type LikedPlaceList = PlaceList & {
  likedAt: string
}

export async function listLikedPlaceLists(): Promise<LikedPlaceList[]> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: likeRows, error: likesError } = await supabase
    .from("place_list_likes")
    .select("place_list_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (likesError) throw wrapPostgrestError("listLikedPlaceLists/likes", likesError)

  const rows = (likeRows ?? []) as Array<{ place_list_id: string; created_at: string }>
  if (rows.length === 0) return []

  const lists = await listPlaceListsByIds(supabase, rows.map((r) => r.place_list_id))
  const byId = new Map(lists.map((l) => [l.id, l]))

  return rows
    .map((r) => {
      const list = byId.get(r.place_list_id)
      if (!list) return null
      return { ...list, likedAt: r.created_at }
    })
    .filter((v): v is LikedPlaceList => v !== null)
}

export async function countLiked(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("place_list_likes")
    .select("place_list_id", { count: "exact", head: true })
    .eq("user_id", userId)

  if (error) throw wrapPostgrestError("countLiked", error)
  return count ?? 0
}

export async function countPlaceListLikes(placeListId: string): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("place_list_likes")
    .select("place_list_id", { count: "exact", head: true })
    .eq("place_list_id", placeListId)

  if (error) {
    console.error("countPlaceListLikes error:", error)
    return 0
  }
  return count ?? 0
}
