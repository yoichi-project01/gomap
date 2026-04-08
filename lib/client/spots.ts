// フロントエンド担当
// /api/spots エンドポイントを呼び出す関数群
// componentsやapp/page.tsxからimportして使う

import type { Spot, CreateSpotInput } from "@/types/spot";

export async function getSpots(): Promise<Spot[]> {
  const res = await fetch("/api/spots");
  if (!res.ok) throw new Error("スポットの取得に失敗しました");
  return res.json();
}

export async function createSpot(input: CreateSpotInput): Promise<Spot> {
  const res = await fetch("/api/spots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("スポットの登録に失敗しました");
  return res.json();
}
