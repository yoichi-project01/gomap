"use client";

export const VIEW_HISTORY_KEY = "gomap:viewHistory";
const MAX_ENTRIES = 50;

export type HistoryEntry = {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  spotsCount: number;
  viewedAt: number;
};

function safeParse(raw: string | null): HistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        e &&
        typeof e.id === "string" &&
        typeof e.name === "string" &&
        typeof e.spotsCount === "number" &&
        typeof e.viewedAt === "number"
    );
  } catch {
    return [];
  }
}

export function readViewHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(VIEW_HISTORY_KEY));
}

function writeViewHistory(entries: HistoryEntry[]) {
  const serialized = JSON.stringify(entries);
  window.localStorage.setItem(VIEW_HISTORY_KEY, serialized);
  window.dispatchEvent(new StorageEvent("storage", { key: VIEW_HISTORY_KEY }));
}

export function recordView(entry: Omit<HistoryEntry, "viewedAt">) {
  if (typeof window === "undefined") return;
  const existing = readViewHistory();
  const filtered = existing.filter((e) => e.id !== entry.id);
  const next: HistoryEntry[] = [
    { ...entry, viewedAt: Date.now() },
    ...filtered,
  ].slice(0, MAX_ENTRIES);
  writeViewHistory(next);
}

export function removeFromHistory(id: string) {
  if (typeof window === "undefined") return;
  const next = readViewHistory().filter((e) => e.id !== id);
  writeViewHistory(next);
}

export function clearViewHistory() {
  if (typeof window === "undefined") return;
  writeViewHistory([]);
}
