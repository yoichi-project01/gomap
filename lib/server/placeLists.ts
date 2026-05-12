import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlaceList, Spot } from "@/types/spot";

type SpotRow = {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  prefecture: string | null;
  category: string | null;
  creator: string | null;
  created_at: string;
};

type PlaceListRow = {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  creator: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
};

type PlaceListWithSpotsRow = PlaceListRow & {
  place_list_spots: Array<{
    position: number;
    spots: SpotRow;
  }>;
};

function spotRowToSpot(row: SpotRow): Spot {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    lat: row.lat,
    lng: row.lng,
    prefecture: row.prefecture ?? undefined,
    category: row.category ?? undefined,
    creator: row.creator ?? undefined,
    createdAt: row.created_at,
    createdBy: row.creator ?? undefined,
  };
}

function rowToPlaceList(row: PlaceListWithSpotsRow): PlaceList {
  const sortedSpots = [...row.place_list_spots]
    .sort((a, b) => a.position - b.position)
    .map((pls) => spotRowToSpot(pls.spots));

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    creator: row.creator ?? undefined,
    likes: row.likes_count,
    coverImageUrl: row.cover_image_url ?? undefined,
    createdAt: row.created_at,
    spots: sortedSpots,
  };
}

const SELECT_WITH_SPOTS = `
  *,
  place_list_spots (
    position,
    spots (*)
  )
`;

export async function listPlaceLists(client: SupabaseClient): Promise<PlaceList[]> {
  const { data, error } = await client
    .from("place_lists")
    .select(SELECT_WITH_SPOTS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as PlaceListWithSpotsRow[]).map(rowToPlaceList);
}

export async function getPlaceListById(
  client: SupabaseClient,
  id: string,
): Promise<PlaceList | null> {
  const { data, error } = await client
    .from("place_lists")
    .select(SELECT_WITH_SPOTS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToPlaceList(data as unknown as PlaceListWithSpotsRow) : null;
}

export type CreatePlaceListInput = {
  name: string;
  description?: string;
  creator: string; // auth.users.id (uuid)
  coverImageUrl?: string;
  spotIds: string[];
};

export async function createPlaceList(
  client: SupabaseClient,
  input: CreatePlaceListInput,
): Promise<PlaceList> {
  const { data: created, error: insertError } = await client
    .from("place_lists")
    .insert({
      name: input.name,
      description: input.description ?? null,
      creator: input.creator,
      cover_image_url: input.coverImageUrl ?? null,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;

  if (input.spotIds.length > 0) {
    const rows = input.spotIds.map((spotId, index) => ({
      place_list_id: created.id,
      spot_id: spotId,
      position: index + 1,
    }));

    const { error: linkError } = await client.from("place_list_spots").insert(rows);
    if (linkError) {
      // place_list 側を巻き戻し (Supabase はトランザクション API がない)
      await client.from("place_lists").delete().eq("id", created.id);
      throw linkError;
    }
  }

  const fresh = await getPlaceListById(client, created.id);
  if (!fresh) throw new Error("作成したプレイスリストの再取得に失敗しました");
  return fresh;
}

// 削除成功時 true。対象がない / 権限なし (RLS) は false。
export async function deletePlaceList(
  client: SupabaseClient,
  id: string,
): Promise<boolean> {
  const { data, error } = await client.from("place_lists").delete().eq("id", id).select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
