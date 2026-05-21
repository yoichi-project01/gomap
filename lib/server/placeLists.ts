import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlaceList, Spot } from "@/types/spot";
import { fetchCreatorProfiles } from "@/lib/server/profiles";

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
  category: string | null;
  cover_image_url: string | null;
  creator: string | null;
  likes_count: number;
  is_public: boolean;
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

function rowToPlaceList(
  row: PlaceListWithSpotsRow,
  profileByCreator: Map<string, { displayName: string | null; avatarUrl: string | null }>,
): PlaceList {
  const sortedSpots = [...row.place_list_spots]
    .sort((a, b) => a.position - b.position)
    .map((pls) => pls.spots && spotRowToSpot(pls.spots))
    .filter((s): s is Spot => Boolean(s));

  const creatorProfile = row.creator ? profileByCreator.get(row.creator) : undefined;

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    category: row.category ?? undefined,
    creator: row.creator ?? undefined,
    creatorName: creatorProfile?.displayName ?? undefined,
    creatorAvatarUrl: creatorProfile?.avatarUrl ?? undefined,
    likes: row.likes_count,
    coverImageUrl: row.cover_image_url ?? undefined,
    isPublic: row.is_public,
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

export type ListPlaceListsFilters = {
  creator?: string; // 指定すると creator に一致するものだけ返す
};

export async function listPlaceLists(
  client: SupabaseClient,
  filters: ListPlaceListsFilters = {},
): Promise<PlaceList[]> {
  let query = client
    .from("place_lists")
    .select(SELECT_WITH_SPOTS)
    .order("created_at", { ascending: false });

  if (filters.creator) query = query.eq("creator", filters.creator);

  const { data, error } = await query;
  if (error) throw error;
  const rows = data as unknown as PlaceListWithSpotsRow[];
  const profileByCreator = await fetchCreatorProfiles(
    client,
    rows.map((r) => r.creator),
  );
  return rows.map((row) => rowToPlaceList(row, profileByCreator));
}

// 指定された ID のプレイスリストをまとめて取得。返却順は保証しない (呼び出し側で並べ替えること)。
export async function listPlaceListsByIds(
  client: SupabaseClient,
  ids: string[],
): Promise<PlaceList[]> {
  if (ids.length === 0) return [];

  const { data, error } = await client
    .from("place_lists")
    .select(SELECT_WITH_SPOTS)
    .in("id", ids);

  if (error) throw error;
  const rows = (data ?? []) as unknown as PlaceListWithSpotsRow[];
  const profileByCreator = await fetchCreatorProfiles(
    client,
    rows.map((r) => r.creator),
  );
  return rows.map((row) => rowToPlaceList(row, profileByCreator));
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
  if (!data) return null;
  const row = data as unknown as PlaceListWithSpotsRow;
  const profileByCreator = await fetchCreatorProfiles(client, [row.creator]);
  return rowToPlaceList(row, profileByCreator);
}

export type CreatePlaceListInput = {
  name: string;
  description?: string;
  category?: string;
  creator: string; // auth.users.id (uuid)
  coverImageUrl?: string;
  isPublic?: boolean; // 省略時は true (公開)
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
      category: input.category ?? null,
      creator: input.creator,
      cover_image_url: input.coverImageUrl ?? null,
      is_public: input.isPublic ?? true,
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

// 直近 N 日間に各プレイスリストに付いた place_list_likes の件数を集計。
// 戻り値は place_list_id → count の Map。出現しないものは 0 とみなす。
// 全ユーザーのいいねを集計する必要があるので、RLS を迂回する service_role
// クライアントから呼び出すこと。
export async function fetchRecentLikeCounts(
  client: SupabaseClient,
  sinceDays: number,
): Promise<Map<string, number>> {
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);

  const { data, error } = await client
    .from("place_list_likes")
    .select("place_list_id")
    .gte("created_at", since.toISOString());

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ place_list_id: string }>) {
    counts.set(row.place_list_id, (counts.get(row.place_list_id) ?? 0) + 1);
  }
  return counts;
}

export async function countPlaceListsByCreator(
  client: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await client
    .from("place_lists")
    .select("id", { count: "exact", head: true })
    .eq("creator", userId);
  if (error) throw error;
  return count ?? 0;
}

export type UpdatePlaceListInput = {
  name: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  isPublic?: boolean; // 省略時は true (公開)
  spotIds: string[];
};

export async function updatePlaceList(
  client: SupabaseClient,
  id: string,
  input: UpdatePlaceListInput,
): Promise<PlaceList | null> {
  const { data, error: updateError } = await client
    .from("place_lists")
    .update({
      name: input.name,
      description: input.description ?? null,
      category: input.category ?? null,
      cover_image_url: input.coverImageUrl ?? null,
      is_public: input.isPublic ?? true,
    })
    .eq("id", id)
    .select("id");

  if (updateError) throw updateError;
  if (!data || data.length === 0) return null;

  const { error: deleteError } = await client
    .from("place_list_spots")
    .delete()
    .eq("place_list_id", id);
  if (deleteError) throw deleteError;

  if (input.spotIds.length > 0) {
    const rows = input.spotIds.map((spotId, index) => ({
      place_list_id: id,
      spot_id: spotId,
      position: index + 1,
    }));
    const { error: linkError } = await client.from("place_list_spots").insert(rows);
    if (linkError) throw linkError;
  }

  return getPlaceListById(client, id);
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
