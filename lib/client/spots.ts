// フロントから /api/spots を叩く関数群
// componentsやページからimportして使う

import type { Spot, SpotSource } from "@/types/spot";

export type ListSpotsParams = {
  prefecture?: string;
  category?: string;
  q?: string;
};

export type CreateSpotInput = {
  name: string;
  lat: number;
  lng: number;
  description?: string;
  prefecture?: string;
  category?: string;
  creator?: string;
  source?: SpotSource;
  coverImageUrl?: string;
};

function buildQuery(params: ListSpotsParams): string {
  const sp = new URLSearchParams();
  if (params.prefecture) sp.set("prefecture", params.prefecture);
  if (params.category) sp.set("category", params.category);
  if (params.q) sp.set("q", params.q);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function getSpots(params: ListSpotsParams = {}): Promise<Spot[]> {
  const res = await fetch(`/api/spots${buildQuery(params)}`);
  if (!res.ok) throw new Error("スポット一覧の取得に失敗しました");
  return res.json();
}

export async function getSpotById(id: string): Promise<Spot> {
  const res = await fetch(`/api/spots/${encodeURIComponent(id)}`);
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

export type UpdateSpotInput = {
  name?: string;
  description?: string | null;
  lat?: number;
  lng?: number;
  prefecture?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
};

export async function updateSpot(id: string, input: UpdateSpotInput): Promise<Spot> {
  const res = await fetch(`/api/spots/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("スポットの更新に失敗しました");
  return res.json();
}

export async function deleteSpot(id: string): Promise<void> {
  const res = await fetch(`/api/spots/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("スポットの削除に失敗しました");
}
