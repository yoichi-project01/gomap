// 絞り込みプリセット (filter_presets) のサーバー側 CRUD
// RLS により自分のプリセットしか読み書きできない

import type { SupabaseClient } from "@supabase/supabase-js";

export type FilterPreset = {
  id: string;
  name: string;
  // 保存時の絞り込み条件。PlaceListFilters の Plain JSON 表現。
  // 厳密な型は持たず、クライアント側で必要に応じてバリデーション。
  params: Record<string, unknown>;
  createdAt: string;
};

type Row = {
  id: string;
  name: string;
  params: Record<string, unknown>;
  created_at: string;
};

function rowToPreset(row: Row): FilterPreset {
  return {
    id: row.id,
    name: row.name,
    params: row.params ?? {},
    createdAt: row.created_at,
  };
}

export async function listFilterPresets(
  client: SupabaseClient,
  userId: string,
): Promise<FilterPreset[]> {
  const { data, error } = await client
    .from("filter_presets")
    .select("id, name, params, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Row[]).map(rowToPreset);
}

export async function createFilterPreset(
  client: SupabaseClient,
  userId: string,
  input: { name: string; params: Record<string, unknown> },
): Promise<FilterPreset> {
  const { data, error } = await client
    .from("filter_presets")
    .insert({
      user_id: userId,
      name: input.name,
      params: input.params,
    })
    .select("id, name, params, created_at")
    .single();
  if (error) throw error;
  return rowToPreset(data as Row);
}

// 削除成功時 true、対象がない / 権限なし (RLS) は false。
export async function deleteFilterPreset(
  client: SupabaseClient,
  id: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("filter_presets")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
