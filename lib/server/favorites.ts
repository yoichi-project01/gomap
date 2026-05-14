// お気に入りスポットのサーバー側データアクセス
// RLS でユーザー本人のみが読み書きできる前提

import type { Spot } from "@/types/spot"
import { createSupabaseServerClient } from "./supabaseAuth"

export type FavoriteSpot = Spot & {
  favoritedAt: string
}

type FavoriteRow = {
  spot_id: string
  created_at: string
  spots: {
    id: string
    name: string
    description: string | null
    lat: number
    lng: number
    prefecture: string | null
    category: string | null
    creator: string | null
    source: "user" | "map_ref" | null
    cover_image_url: string | null
    created_at: string
  } | null
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

export async function listFavoriteSpots(): Promise<FavoriteSpot[]> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("favorites")
    .select("spot_id, created_at, spots (*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as unknown as FavoriteRow[]
  return rows
    .filter((r): r is FavoriteRow & { spots: NonNullable<FavoriteRow["spots"]> } => r.spots !== null)
    .map((r) => ({
      id: r.spots.id,
      name: r.spots.name,
      description: r.spots.description ?? undefined,
      lat: r.spots.lat,
      lng: r.spots.lng,
      prefecture: r.spots.prefecture ?? undefined,
      category: r.spots.category ?? undefined,
      creator: r.spots.creator ?? undefined,
      source: r.spots.source ?? "user",
      coverImageUrl: r.spots.cover_image_url ?? undefined,
      createdAt: r.spots.created_at,
      favoritedAt: r.created_at,
    }))
}
