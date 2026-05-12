import type { SupabaseClient } from "@supabase/supabase-js";
import type { Spot } from "@/types/spot";

type SpotRow = {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  prefecture: string | null;
  category: string | null;
  creator: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
};

function rowToSpot(row: SpotRow): Spot {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    lat: row.lat,
    lng: row.lng,
    prefecture: row.prefecture ?? undefined,
    category: row.category ?? undefined,
    creator: row.creator ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    createdAt: row.created_at,
    createdBy: row.creator ?? undefined,
  };
}

export type ListSpotsFilters = {
  prefecture?: string;
  category?: string;
  q?: string;
};

export async function listSpots(
  client: SupabaseClient,
  filters: ListSpotsFilters = {},
): Promise<Spot[]> {
  let query = client.from("spots").select("*").order("created_at", { ascending: false });

  if (filters.prefecture) query = query.eq("prefecture", filters.prefecture);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.q) query = query.or(`name.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data as SpotRow[]).map(rowToSpot);
}

export async function getSpotById(
  client: SupabaseClient,
  id: string,
): Promise<Spot | null> {
  const { data, error } = await client.from("spots").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToSpot(data as SpotRow) : null;
}

export async function listSpotsByCreator(
  client: SupabaseClient,
  userId: string,
): Promise<Spot[]> {
  const { data, error } = await client
    .from("spots")
    .select("*")
    .eq("creator", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as SpotRow[]).map(rowToSpot);
}

export async function countSpotsByCreator(
  client: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await client
    .from("spots")
    .select("id", { count: "exact", head: true })
    .eq("creator", userId);
  if (error) throw error;
  return count ?? 0;
}

export type CreateSpotInput = {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  prefecture?: string;
  category?: string;
  creator: string; // auth.users.id (uuid)
  coverImageUrl?: string;
};

export async function createSpot(
  client: SupabaseClient,
  input: CreateSpotInput,
): Promise<Spot> {
  const { data, error } = await client
    .from("spots")
    .insert({
      name: input.name,
      description: input.description ?? null,
      lat: input.lat,
      lng: input.lng,
      prefecture: input.prefecture ?? null,
      category: input.category ?? null,
      creator: input.creator,
      cover_image_url: input.coverImageUrl ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToSpot(data as SpotRow);
}

// 削除成功時 true、対象がない / 権限なし (RLS) は false
export async function deleteSpot(
  client: SupabaseClient,
  id: string,
): Promise<boolean> {
  const { data, error } = await client.from("spots").delete().eq("id", id).select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
