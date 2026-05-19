"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"

export type ToggleSpotLikeResult =
  | { ok: true; liked: boolean }
  | { ok: false; reason: "unauthenticated" | "error"; message?: string }

export async function toggleSpotLikeAction(spotId: string): Promise<ToggleSpotLikeResult> {
  if (!spotId) return { ok: false, reason: "error", message: "spotId が空です" }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: "unauthenticated" }

  const { data: existing, error: selErr } = await supabase
    .from("spot_likes")
    .select("spot_id")
    .eq("spot_id", spotId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (selErr) return { ok: false, reason: "error", message: selErr.message }

  if (existing) {
    const { error } = await supabase
      .from("spot_likes")
      .delete()
      .eq("spot_id", spotId)
      .eq("user_id", user.id)
    if (error) return { ok: false, reason: "error", message: error.message }
    await supabase.rpc("increment_spot_likes", { spot_id_param: spotId, delta: -1 })
    revalidatePath(`/spots/${spotId}`)
    return { ok: true, liked: false }
  }

  const { error } = await supabase
    .from("spot_likes")
    .insert({ spot_id: spotId, user_id: user.id })
  if (error) return { ok: false, reason: "error", message: error.message }
  await supabase.rpc("increment_spot_likes", { spot_id_param: spotId, delta: 1 })
  revalidatePath(`/spots/${spotId}`)
  return { ok: true, liked: true }
}
