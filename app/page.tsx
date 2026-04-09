import Map from "@/components/Map";
import Header from "@/components/Header";
import { DUMMY_SPOTS } from "@/lib/client/dummySpots";

// Supabase連携後は以下に差し替える:
//   const { data: spots } = await supabase.from("spots").select("*")

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
