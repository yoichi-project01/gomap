"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"

export type ToggleFavoriteResult =
  | { ok: true; favorited: boolean }
  | { ok: false; reason: "unauthenticated" | "error"; message?: string }

export async function toggleFavoriteAction(spotId: string): Promise<ToggleFavoriteResult> {
  if (!spotId) return { ok: false, reason: "error", message: "spotId が空です" }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: "unauthenticated" }

  const { data: existing, error: selErr } = await supabase
    .from("favorites")
    .select("spot_id")
    .eq("spot_id", spotId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (selErr) return { ok: false, reason: "error", message: selErr.message }

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("spot_id", spotId)
      .eq("user_id", user.id)
    if (error) return { ok: false, reason: "error", message: error.message }
    revalidatePath(`/spots/${spotId}`)
    return { ok: true, favorited: false }
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ spot_id: spotId, user_id: user.id })
  if (error) return { ok: false, reason: "error", message: error.message }
  revalidatePath(`/spots/${spotId}`)
  return { ok: true, favorited: true }
}
