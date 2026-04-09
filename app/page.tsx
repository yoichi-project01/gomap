import Map from "@/components/Map";
import Header from "@/components/Header";
import type { Spot } from "@/types/spot";

// ダミーデータ
// Supabase連携後は以下に差し替える:
//   const { data: spots } = await supabase.from("spots").select("*")
const DUMMY_SPOTS: Spot[] = [
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

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      {/* 地図はヘッダーの残りの高さいっぱいに表示 */}
      <div className="flex-1">
        <Map spots={DUMMY_SPOTS} />
      </div>
    </div>
  );
}
