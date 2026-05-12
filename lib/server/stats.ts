// ユーザーごとの集計
//   placeListsCount: 自分が作ったプレイスリスト数
//   favoritesCount : 自分がお気に入りしたスポット数
//   likesReceived  : 自分のプレイスリストにもらったいいね合計

import { supabase as adminClient } from "./supabase";

export type UserStats = {
  placeListsCount: number;
  favoritesCount: number;
  likesReceived: number;
};

export async function getUserStats(userId: string): Promise<UserStats> {
  // count: 'exact', head: true で件数だけ取得 (RLS をバイパスしたいので service_role)
  const [placeListsRes, favoritesRes, likesAgg] = await Promise.all([
    adminClient
      .from("place_lists")
      .select("id", { count: "exact", head: true })
      .eq("creator", userId),
    adminClient
      .from("favorites")
      .select("spot_id", { count: "exact", head: true })
      .eq("user_id", userId),
    adminClient
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
