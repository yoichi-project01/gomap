import type { Spot } from "@/types/spot";

// 開発用ダミーデータ
// Supabase連携後は getSpots() に差し替えて、このファイルは削除してよい
export const DUMMY_SPOTS: Spot[] = [
  {
    id: "1",
    name: "大阪城",
    description: "豊臣秀吉が築いた歴史的な城",
    lat: 34.6873,
    lng: 135.5262,
    createdAt: "2026-04-09",
    createdBy: "user-1",
  },
  {
    id: "2",
    name: "道頓堀",
    description: "大阪を代表する繁華街。グリコサインで有名",
    lat: 34.6687,
    lng: 135.5014,
    createdAt: "2026-04-09",
    createdBy: "user-1",
  },
  {
    id: "3",
    name: "通天閣",
    description: "新世界のシンボルタワー",
    lat: 34.6526,
    lng: 135.5061,
    createdAt: "2026-04-09",
    createdBy: "user-1",
  },
];
