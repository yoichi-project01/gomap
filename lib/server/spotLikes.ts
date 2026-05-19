import type { Spot } from "@/types/spot"
import { createSupabaseServerClient } from "./supabaseAuth"

export type LikedSpot = Spot & { likedAt: string }

export async function isSpotLiked(spotId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from("spot_likes")
    .select("spot_id")
    .eq("spot_id", spotId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) return false
  return data !== null
}

export async function listLikedSpots(): Promise<LikedSpot[]> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: likeRows, error: likesError } = await supabase
    .from("spot_likes")
    .select("spot_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (likesError) return []
  if (!likeRows || likeRows.length === 0) return []

  const spotIds = likeRows.map((r) => r.spot_id as string)
  const { data: spotsData, error: spotsError } = await supabase
    .from("spots")
    .select("*")
    .in("id", spotIds)

  if (spotsError) return []

  type SpotRow = {
    id: string; name: string; description: string | null; lat: number; lng: number;
    prefecture: string | null; category: string | null; creator: string | null;
    source: "user" | "map_ref" | null; cover_image_url: string | null;
    likes_count: number; created_at: string;
  }
  const spotById = new Map((spotsData ?? []).map((s) => [s.id, s as SpotRow]))

  return likeRows
    .map((r) => {
      const spot = spotById.get(r.spot_id as string)
      if (!spot) return null
      return {
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
        likesCount: spot.likes_count,
        createdAt: spot.created_at,
        likedAt: r.created_at as string,
      }
    })
    .filter((v): v is LikedSpot => v !== null)
}

export async function countLikedSpots(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from("spot_likes")
    .select("spot_id", { count: "exact", head: true })
    .eq("user_id", user.id)

  if (error) return 0
  return count ?? 0
}
