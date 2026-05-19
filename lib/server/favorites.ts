// お気に入りスポットのサーバー側データアクセス
// RLS でユーザー本人のみが読み書きできる前提

import type { Spot } from "@/types/spot"
import { createSupabaseServerClient } from "./supabaseAuth"

export type FavoriteSpot = Spot & {
  favoritedAt: string
}


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

  if (error) {
    console.error("isSpotFavorited error:", error)
    return false
  }
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

export async function listFavoriteSpots(): Promise<FavoriteSpot[]> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: favRows, error: favError } = await supabase
    .from("favorites")
    .select("spot_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (favError) throw favError
  if (!favRows || favRows.length === 0) return []

  const spotIds = favRows.map((r) => r.spot_id as string)
  const { data: spotsData, error: spotsError } = await supabase
    .from("spots")
    .select("*")
    .in("id", spotIds)

  if (spotsError) throw spotsError

  type SpotData = {
    id: string; name: string; description: string | null; lat: number; lng: number;
    prefecture: string | null; category: string | null; creator: string | null;
    source: "user" | "map_ref" | null; cover_image_url: string | null; created_at: string;
  }
  const spotById = new Map((spotsData ?? []).map((s) => [s.id, s as SpotData]))

  return favRows.flatMap((r): FavoriteSpot[] => {
    const spot = spotById.get(r.spot_id as string)
    if (!spot) return []
    return [{
      id: spot.id,
      name: spot.name,
      description: spot.description ?? undefined,
      lat: spot.lat,
      lng: spot.lng,
      prefecture: spot.prefecture ?? undefined,
      category: spot.category ?? undefined,
      creator: spot.creator ?? undefined,
      source: spot.source ?? "user",
      coverImageUrl: spot.cover_image_url ?? undefined,
      createdAt: spot.created_at,
      favoritedAt: r.created_at as string,
    }]
  })
}
