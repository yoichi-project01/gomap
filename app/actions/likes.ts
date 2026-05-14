"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"

export type ToggleLikeResult =
  | { ok: true; liked: boolean }
  | { ok: false; reason: "unauthenticated" | "error"; message?: string }

async function adjustLikesCount(placeListId: string, delta: 1 | -1): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.rpc("increment_place_list_likes", { list_id: placeListId, delta })
}

export async function togglePlaceListLikeAction(placeListId: string): Promise<ToggleLikeResult> {
  if (!placeListId) return { ok: false, reason: "error", message: "placeListId が空です" }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: "unauthenticated" }

  const { data: existing, error: selErr } = await supabase
    .from("place_list_likes")
    .select("place_list_id")
    .eq("place_list_id", placeListId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (selErr) return { ok: false, reason: "error", message: selErr.message }

  if (existing) {
    const { error } = await supabase
      .from("place_list_likes")
      .delete()
      .eq("place_list_id", placeListId)
      .eq("user_id", user.id)
    if (error) return { ok: false, reason: "error", message: error.message }
    await adjustLikesCount(placeListId, -1)
    revalidatePath(`/placelists/${placeListId}`)
    return { ok: true, liked: false }
  }

  const { error } = await supabase
    .from("place_list_likes")
    .insert({ place_list_id: placeListId, user_id: user.id })
  if (error) return { ok: false, reason: "error", message: error.message }
  await adjustLikesCount(placeListId, 1)
  revalidatePath(`/placelists/${placeListId}`)
  return { ok: true, liked: true }
}
