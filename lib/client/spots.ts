// フロントエンド担当
// APIエンドポイントを呼び出す関数群
// componentsやapp/page.tsxからimportして使う

import type { PlaceList } from "@/types/spot";

// プレイスリスト作成用の入力型
export type CreatePlaceListInput = Omit<PlaceList, "id">;

// プレイスリスト一覧を取得
export async function getPlaceLists(): Promise<PlaceList[]> {
  const res = await fetch("/api/placelists");
  if (!res.ok) throw new Error("プレイスリストの取得に失敗しました");
  return res.json();
}

// 新しいプレイスリストを作成
export async function createPlaceList(input: CreatePlaceListInput): Promise<PlaceList> {
  const res = await fetch("/api/placelists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("プレイスリストの登録に失敗しました");
  return res.json();
}