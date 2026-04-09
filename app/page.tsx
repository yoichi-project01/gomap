import Map from "@/components/Map";
import Header from "@/components/Header";

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
