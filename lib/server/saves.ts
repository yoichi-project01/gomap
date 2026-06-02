// プレイスリスト「保存」(ブックマーク) のサーバー側データアクセス
// RLS でユーザー本人のみが読み書きできる前提

import type { PostgrestError } from "@supabase/supabase-js";
import type { PlaceList } from "@/types/spot";
import { createSupabaseServerClient } from "./supabaseAuth";
import { listPlaceListsByIds } from "./placeLists";

function wrapPostgrestError(prefix: string, error: PostgrestError): Error {
  const parts = [error.message, error.details, error.hint, error.code]
    .filter((s): s is string => typeof s === "string" && s.length > 0);
  const wrapped = new Error(`${prefix}: ${parts.join(" / ")}`);
  console.error(prefix, error);
  return wrapped;
}

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

  if (error) {
    console.error("isPlaceListSaved error:", error)
    return false
  }
  return data !== null;
}

export type SavedPlaceList = PlaceList & {
  savedAt: string;
};

export async function listSavedPlaceLists(): Promise<SavedPlaceList[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: saveRows, error: savesError } = await supabase
    .from("place_list_saves")
    .select("place_list_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (savesError) throw wrapPostgrestError("listSavedPlaceLists/saves", savesError);

  const rows = (saveRows ?? []) as Array<{ place_list_id: string; created_at: string }>;
  if (rows.length === 0) return [];

  const lists = await listPlaceListsByIds(supabase, rows.map((r) => r.place_list_id));
  const byId = new Map(lists.map((l) => [l.id, l]));

  return rows
    .map((r) => {
      const list = byId.get(r.place_list_id);
      if (!list) return null;
      return { ...list, savedAt: r.created_at };
    })
    .filter((v): v is SavedPlaceList => v !== null);
}

export async function countPlaceListSaves(placeListId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("place_list_saves")
    .select("place_list_id", { count: "exact", head: true })
    .eq("place_list_id", placeListId);

  if (error) {
    console.error("countPlaceListSaves error:", error);
    return 0;
  }
  return count ?? 0;
}

export async function countSaved(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("place_list_saves")
    .select("place_list_id, place_lists!inner(id)", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw wrapPostgrestError("countSaved", error);
  return count ?? 0;
}
