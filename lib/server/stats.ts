// ユーザーごとの集計
//   placeListsCount: 自分が作ったプレイスリスト数
//   favoritesCount : 自分がお気に入りしたスポット数
//   likesReceived  : 自分のプレイスリストにもらったいいね合計
//
// RLS は本人のデータを読める設計なので、ユーザースコープクライアントで十分。
// service_role は使わない（最小権限の原則）。

import type { SupabaseClient } from "@supabase/supabase-js";

export type UserStats = {
  placeListsCount: number;
  favoritesCount: number;
  likesReceived: number;
};

export async function getUserStats(
  client: SupabaseClient,
  userId: string,
): Promise<UserStats> {
  const [placeListsRes, favoritesRes, likesAgg] = await Promise.all([
    client
      .from("place_lists")
      .select("id", { count: "exact", head: true })
      .eq("creator", userId),
    client
      .from("favorites")
      .select("spot_id", { count: "exact", head: true })
      .eq("user_id", userId),
    client
      .from("place_lists")
      .select("likes_count")
      .eq("creator", userId),
  ]);

  if (placeListsRes.error) throw placeListsRes.error;
  if (favoritesRes.error)  throw favoritesRes.error;
  if (likesAgg.error)      throw likesAgg.error;

  const likesReceived = (likesAgg.data ?? []).reduce(
    (sum, row) => sum + (row.likes_count ?? 0),
    0,
  );

  return {
    placeListsCount: placeListsRes.count ?? 0,
    favoritesCount:  favoritesRes.count  ?? 0,
    likesReceived,
  };
}
