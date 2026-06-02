import type { SupabaseClient } from "@supabase/supabase-js";
import type { Spot } from "@/types/spot";

type SpotSource = "user" | "map_ref";

type SpotRow = {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  prefecture: string | null;
  category: string | null;
  creator: string | null;
  source: SpotSource | null;
  cover_image_url: string | null;
  likes_count?: number;
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
    source: row.source ?? "user",
    coverImageUrl: row.cover_image_url ?? undefined,
    createdAt: row.created_at,
    createdBy: row.creator ?? undefined,
    likesCount: (row as { likes_count?: number }).likes_count ?? 0,
  };
}

export type ListSpotsFilters = {
  prefecture?: string;
  category?: string;
  q?: string;
};

// PostgREST の or() 構文は ,()*% などをパースするため、ユーザー入力に
// これらの文字が含まれるとクエリが壊れる。ilike の値部分はクォートして渡し、
// クォート内のダブルクォートを \" にエスケープする。
function escapeIlikeArg(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function listSpots(
  client: SupabaseClient,
  filters: ListSpotsFilters = {},
): Promise<Spot[]> {
  let query = client.from("spots").select("*").order("created_at", { ascending: false });

  if (filters.prefecture) query = query.eq("prefecture", filters.prefecture);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.q) {
    const q = escapeIlikeArg(filters.q);
    query = query.or(`name.ilike."%${q}%",description.ilike."%${q}%"`);
  }

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

// マイページ「登録したスポット」用: ユーザーが明示的に登録した source='user' のみ。
// マップ検索からプレイスリスト用に作られた 'map_ref' は除外。
export async function listSpotsByCreator(
  client: SupabaseClient,
  userId: string,
): Promise<Spot[]> {
  const { data, error } = await client
    .from("spots")
    .select("*")
    .eq("creator", userId)
    .eq("source", "user")
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
    .eq("creator", userId)
    .eq("source", "user");
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
  source?: SpotSource;
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
      source: input.source ?? "user",
      cover_image_url: input.coverImageUrl ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToSpot(data as SpotRow);
}

export type UpdateSpotInput = {
  name?: string;
  description?: string | null;
  lat?: number;
  lng?: number;
  prefecture?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
};

export async function updateSpot(
  client: SupabaseClient,
  id: string,
  input: UpdateSpotInput,
): Promise<Spot | null> {
  const patch: Record<string, unknown> = {};
  if (input.name         !== undefined) patch.name            = input.name;
  if (input.description  !== undefined) patch.description     = input.description  ?? null;
  if (input.lat          !== undefined) patch.lat             = input.lat;
  if (input.lng          !== undefined) patch.lng             = input.lng;
  if (input.prefecture   !== undefined) patch.prefecture      = input.prefecture   ?? null;
  if (input.category     !== undefined) patch.category        = input.category     ?? null;
  if (input.coverImageUrl !== undefined) patch.cover_image_url = input.coverImageUrl ?? null;

  const { data, error } = await client
    .from("spots")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? rowToSpot(data as SpotRow) : null;
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
