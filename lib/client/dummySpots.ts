import type { Spot } from "@/types/spot"

// Spot型を拡張してフィルタ用フィールドを追加（Supabase連携後はDBのカラムに対応）
export type SpotWithMeta = Spot & {
  prefecture: string
  category: string
}

// スポット集合を表現する型
export type SpotGroup = {
  id: string
  name: string
  description: string
  spots: Spot[]
}

export const DUMMY_SPOTS: SpotWithMeta[] = [
  {
    id: "1",
    name: "大阪城",
    description: "豊臣秀吉が築いた歴史的な城",
    lat: 34.6873,
    lng: 135.5262,
    createdAt: "2026-04-09",
    createdBy: "user-1",
    prefecture: "大阪府",
    category: "観光",
  },
  {
    id: "2",
    name: "道頓堀",
    description: "大阪を代表する繁華街。グリコサインで有名",
    lat: 34.6687,
    lng: 135.5014,
    createdAt: "2026-04-08",
    createdBy: "user-1",
    prefecture: "大阪府",
    category: "グルメ",
  },
  {
    id: "3",
    name: "通天閣",
    description: "新世界のシンボルタワー",
    lat: 34.6526,
    lng: 135.5061,
    createdAt: "2026-04-07",
    createdBy: "user-1",
    prefecture: "大阪府",
    category: "観光",
  },
  {
    id: "4",
    name: "USJ",
    description: "ユニバーサル・スタジオ・ジャパン",
    lat: 34.6654,
    lng: 135.4323,
    createdAt: "2026-04-06",
    createdBy: "user-2",
    prefecture: "大阪府",
    category: "その他",
  },
  {
    id: "5",
    name: "金閣寺",
    description: "世界遺産。正式名は鹿苑寺",
    lat: 35.0394,
    lng: 135.7292,
    createdAt: "2026-04-05",
    createdBy: "user-2",
    prefecture: "京都府",
    category: "観光",
  },
  {
    id: "6",
    name: "錦市場",
    description: "京の台所と呼ばれる商店街",
    lat: 35.0047,
    lng: 135.7648,
    createdAt: "2026-04-04",
    createdBy: "user-2",
    prefecture: "京都府",
    category: "グルメ",
  },
  {
    id: "7",
    name: "北野天満宮",
    description: "学問の神様・菅原道真を祀る神社",
    lat: 35.0325,
    lng: 135.7356,
    createdAt: "2026-04-03",
    createdBy: "user-1",
    prefecture: "京都府",
    category: "観光",
  },
]

// スポット集合
export const DUMMY_SPOT_GROUPS: SpotGroup[] = [
  {
    id: "group-new-osaka",
    name: "大阪の観光地7選",
    description: "最近登録された大阪の観光スポット",
    spots: DUMMY_SPOTS.filter(s => s.prefecture === "大阪府").slice(0, 4),
  },
  {
    id: "group-popular-kyoto",
    name: "京都の人気スポット",
    description: "おすすめの京都観光スポット",
    spots: DUMMY_SPOTS.filter(s => s.prefecture === "京都府"),
  },
  {
    id: "group-ranking-gourmet",
    name: "グルメスポットランキング",
    description: "人気のあるグルメスポット",
    spots: DUMMY_SPOTS.filter(s => s.category === "グルメ"),
  },
]
