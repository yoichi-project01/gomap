// フロントから /api/filter-presets を叩く関数群

import type { FilterPreset } from "@/lib/server/filterPresets";

export type { FilterPreset };

export async function getFilterPresets(): Promise<FilterPreset[]> {
  const res = await fetch("/api/filter-presets");
  if (!res.ok) throw new Error("プリセット一覧の取得に失敗しました");
  return res.json();
}

export async function createFilterPreset(input: {
  name: string;
  params: Record<string, unknown>;
}): Promise<FilterPreset> {
  const res = await fetch("/api/filter-presets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("プリセットの保存に失敗しました");
  return res.json();
}

export async function deleteFilterPreset(id: string): Promise<void> {
  const res = await fetch(`/api/filter-presets/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("プリセットの削除に失敗しました");
}
