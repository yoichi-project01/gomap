import HomeHeader from '@/components/home/HomeHeader';
import RecentPlaceLists from '@/components/home/RecentPlaceLists';
import PlaceListScrollSection from '@/components/home/PlaceListScrollSection';
import FilteredResults from '@/components/home/FilteredResults';
import AddPlaceListButton from '@/components/home/AddPlaceListButton';
import { listPlaceLists } from '@/lib/server/placeLists';
import { supabase } from '@/lib/server/supabase';
import { filterPlaceLists, hasActiveFilters, parseFilters } from '@/lib/filter/placeLists';

export const dynamic = 'force-dynamic';

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function HomeDashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const placeLists = await listPlaceLists(supabase);
  const filters = parseFilters(await searchParams);
  const filtering = hasActiveFilters(filters);

  const byNew = placeLists;
  const byRanking = [...placeLists].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
  const featured = byRanking;

  const filtered = filtering ? filterPlaceLists(placeLists, filters) : [];

  return (
    <div className="h-screen overflow-y-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white pb-24 font-sans [&::-webkit-scrollbar]:hidden">
      <HomeHeader />

      <main className="px-4 mt-2">
        {filtering ? (
          <FilteredResults placeLists={filtered} filters={filters} />
        ) : (
          <>
            <RecentPlaceLists placeLists={placeLists} />
            <PlaceListScrollSection title="新着" type="new" placeLists={byNew} />
            <PlaceListScrollSection title="注目" type="featured" placeLists={featured} />
            <PlaceListScrollSection title="ランキング" type="ranking" placeLists={byRanking} />
          </>
        )}
      </main>

      <AddPlaceListButton />
    </div>
  );
}
