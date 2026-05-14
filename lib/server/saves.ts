// プレイスリスト「保存」(ブックマーク) のサーバー側データアクセス
// RLS でユーザー本人のみが読み書きできる前提

import type { PlaceList } from "@/types/spot";
import { createSupabaseServerClient } from "./supabaseAuth";

export async function isPlaceListSaved(placeListId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("place_list_saves")
    .select("place_list_id")
    .eq("place_list_id", placeListId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

const SELECT_WITH_SPOTS = `
  place_list_id,
  created_at,
  place_lists (
    *,
    place_list_spots (
      position,
      spots (*)
    )
  )
`;

type SavedRow = {
  place_list_id: string;
  created_at: string;
  place_lists: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    cover_image_url: string | null;
    creator: string | null;
    likes_count: number;
    created_at: string;
    place_list_spots: Array<{
      position: number;
      spots: {
        id: string;
        name: string;
        description: string | null;
        lat: number;
        lng: number;
        prefecture: string | null;
        category: string | null;
      };
    }>;
  };
};

export type SavedPlaceList = PlaceList & {
  savedAt: string;
};

function rowToSaved(row: SavedRow): SavedPlaceList {
  const list = row.place_lists;
  const spots = [...list.place_list_spots]
    .sort((a, b) => a.position - b.position)
    .map((pls) => ({
      id: pls.spots.id,
      name: pls.spots.name,
      description: pls.spots.description ?? undefined,
      lat: pls.spots.lat,
      lng: pls.spots.lng,
      prefecture: pls.spots.prefecture ?? undefined,
      category: pls.spots.category ?? undefined,
    }));

  return {
    id: list.id,
    name: list.name,
    description: list.description ?? "",
    category: list.category ?? undefined,
    creator: list.creator ?? undefined,
    likes: list.likes_count,
    coverImageUrl: list.cover_image_url ?? undefined,
    createdAt: list.created_at,
    spots,
    savedAt: row.created_at,
  };
}

export async function listSavedPlaceLists(): Promise<SavedPlaceList[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("place_list_saves")
    .select(SELECT_WITH_SPOTS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as SavedRow[])
    .filter((row) => row.place_lists)
    .map(rowToSaved);
}

export async function countSaved(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("place_list_saves")
    .select("place_list_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}
