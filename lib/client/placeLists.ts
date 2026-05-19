// フロントから /api/placelists を叩く関数群
// componentsやページからimportして使う

import type { PlaceList } from "@/types/spot";

export type CreatePlaceListInput = {
  name: string;
  spotIds: string[];
  description?: string;
  category?: string;
  creator?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
};

export async function getPlaceLists(): Promise<PlaceList[]> {
  const res = await fetch("/api/placelists");
  if (!res.ok) throw new Error("プレイスリスト一覧の取得に失敗しました");
  return res.json();
}

export async function getPlaceListById(id: string): Promise<PlaceList> {
  const res = await fetch(`/api/placelists/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("プレイスリストの取得に失敗しました");
  return res.json();
}

export async function createPlaceList(input: CreatePlaceListInput): Promise<PlaceList> {
  const res = await fetch("/api/placelists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("プレイスリストの登録に失敗しました");
  return res.json();
}

export type UpdatePlaceListInput = {
  name: string;
  spotIds: string[];
  description?: string;
  category?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
};

export async function updatePlaceList(id: string, input: UpdatePlaceListInput): Promise<PlaceList> {
  const res = await fetch(`/api/placelists/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("プレイスリストの更新に失敗しました");
  return res.json();
}

export async function deletePlaceList(id: string): Promise<void> {
  const res = await fetch(`/api/placelists/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("プレイスリストの削除に失敗しました");
}
