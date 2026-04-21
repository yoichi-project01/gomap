import HomeHeader from '@/components/home/HomeHeader';
import RecentSpots from '@/components/home/RecentSpots';
import SpotScrollSection from '@/components/home/SpotScrollSection';

export default function HomeDashboard() {
  return (
    <div className="h-screen overflow-y-auto bg-black text-white pb-24 font-sans [&::-webkit-scrollbar]:hidden">
      
      <HomeHeader />

      <main className="px-4 mt-2">
        <RecentSpots />
        <SpotScrollSection title="新着" type="new" />
        <SpotScrollSection title="注目" type="featured" />
        <SpotScrollSection title="ランキング" type="ranking" />
      </main>

      {/* ▼ ここにあった BottomNav は layout.tsx に任せるため削除しました ▼ */}
      
    </div>
  );
}