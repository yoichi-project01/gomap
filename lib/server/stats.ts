// ユーザーごとの集計
//   placeListsCount: 自分が作ったプレイスリスト数
//   favoritesCount : 自分がお気に入りしたスポット数
//   likesReceived  : 自分のプレイスリストにもらったいいね合計
//
// RLS は本人のデータを読める設計なので、ユーザースコープクライアントで十分。
// service_role は使わない（最小権限の原則）。
//
// 注: likes_count の合計は PostgREST の集約関数 (likes_count.sum()) で
// Postgres に押し込むと 1 行返却で済み転送量を減らせるが、Supabase 側で
// db-aggregates-enabled を有効化していないと "column does not exist" 等で
// 失敗する。互換性のため JS 側で reduce する。
// 大量プレイスリストを持つユーザーで遅くなる場合は、ダッシュボードで
// aggregates を有効化するか SECURITY DEFINER の RPC に切り替える。

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
  const [placeListsRes, favoritesRes, userListsRes] = await Promise.all([
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
      .select("id")
      .eq("creator", userId),
  ]);

  if (placeListsRes.error) throw placeListsRes.error;
  if (favoritesRes.error)  throw favoritesRes.error;
  if (userListsRes.error)  throw userListsRes.error;

  // likes_count の非正規化カラムではなく place_list_likes を直接カウント
  let likesReceived = 0;
  const listIds = (userListsRes.data ?? []).map((r: { id: string }) => r.id);
  if (listIds.length > 0) {
    const { count, error } = await client
      .from("place_list_likes")
      .select("place_list_id", { count: "exact", head: true })
      .in("place_list_id", listIds);
    if (error) throw error;
    likesReceived = count ?? 0;
  }

  return {
    placeListsCount: placeListsRes.count ?? 0,
    favoritesCount:  favoritesRes.count  ?? 0,
    likesReceived,
  };
}
