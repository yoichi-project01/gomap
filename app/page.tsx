import HomeHeader from '@/components/home/HomeHeader';
import RecentPlaceLists from '@/components/home/RecentPlaceLists';
import PlaceListScrollSection from '@/components/home/PlaceListScrollSection';
import AddPlaceListButton from '@/components/home/AddPlaceListButton';

export default function HomeDashboard() {
  return (
    <div className="h-screen overflow-y-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white pb-24 font-sans [&::-webkit-scrollbar]:hidden">
      <HomeHeader />

      <main className="px-4 mt-2">
        <RecentPlaceLists />
        <PlaceListScrollSection title="新着" type="new" />
        <PlaceListScrollSection title="注目" type="featured" />
        <PlaceListScrollSection title="ランキング" type="ranking" />
      </main>

      <AddPlaceListButton />
    </div>
  );
}
