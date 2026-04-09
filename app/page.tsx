import MapView from "@/components/MapView";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      {/* 地図はヘッダーの残りの高さいっぱいに表示 */}
      <div className="flex-1">
        <MapView />
      </div>
    </div>
  );
}
