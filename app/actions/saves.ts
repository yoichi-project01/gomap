"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"

export type ToggleSaveResult =
  | { ok: true; saved: boolean }
  | { ok: false; reason: "unauthenticated" | "error"; message?: string }

export async function togglePlaceListSaveAction(placeListId: string): Promise<ToggleSaveResult> {
  if (!placeListId) return { ok: false, reason: "error", message: "placeListId が空です" }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: "unauthenticated" }

  const { data: existing, error: selErr } = await supabase
    .from("place_list_saves")
    .select("place_list_id")
    .eq("place_list_id", placeListId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (selErr) return { ok: false, reason: "error", message: selErr.message }

  if (existing) {
    const { error } = await supabase
      .from("place_list_saves")
      .delete()
      .eq("place_list_id", placeListId)
      .eq("user_id", user.id)
    if (error) return { ok: false, reason: "error", message: error.message }
    revalidatePath("/mylibrary")
    revalidatePath("/mylibrary/saved")
    revalidatePath(`/placelists/${placeListId}`)
    return { ok: true, saved: false }
  }

  const { error } = await supabase
    .from("place_list_saves")
    .insert({ place_list_id: placeListId, user_id: user.id })
  if (error) return { ok: false, reason: "error", message: error.message }
  revalidatePath("/mylibrary")
  revalidatePath("/mylibrary/saved")
  revalidatePath(`/placelists/${placeListId}`)
  return { ok: true, saved: true }
}
