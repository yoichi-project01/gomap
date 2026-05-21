import HomeHeader from '@/components/home/HomeHeader';
import RecentPlaceLists from '@/components/home/RecentPlaceLists';
import PlaceListScrollSection from '@/components/home/PlaceListScrollSection';
import FilteredResults from '@/components/home/FilteredResults';
import AddPlaceListButton from '@/components/home/AddPlaceListButton';
import { fetchRecentLikeCounts, listPlaceLists } from '@/lib/server/placeLists';
import { listSavedPlaceLists } from '@/lib/server/saves';
import { createSupabaseServerClient } from '@/lib/server/supabaseAuth';
import { supabase as adminClient } from '@/lib/server/supabase';
import { filterPlaceLists, hasActiveFilters, parseFilters } from '@/lib/filter/placeLists';

const FEATURED_WINDOW_DAYS = 30;

export const dynamic = 'force-dynamic';

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function HomeDashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // 通常データはユーザースコープ (place_lists / profiles ともに SELECT は select_all)
  const userClient = await createSupabaseServerClient();
  const placeLists = await listPlaceLists(userClient);
  const savedPlaceLists = await listSavedPlaceLists();
  const filters = parseFilters(await searchParams);
  const filtering = hasActiveFilters(filters);

  const byNew = placeLists;
  const byRanking = [...placeLists].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));

  // 注目: 直近 FEATURED_WINDOW_DAYS 日のいいね数の多い順(同数なら累計で安定化)
  // place_list_likes の SELECT は select_own のみ。匿名/全ユーザー集計には service_role が必要。
  const recentLikeCounts = await fetchRecentLikeCounts(adminClient, FEATURED_WINDOW_DAYS);
  const featured = [...placeLists].sort((a, b) => {
    const diff = (recentLikeCounts.get(b.id) ?? 0) - (recentLikeCounts.get(a.id) ?? 0);
    return diff !== 0 ? diff : (b.likes ?? 0) - (a.likes ?? 0);
  });

  const filtered = filtering ? filterPlaceLists(placeLists, filters) : [];

  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v !== undefined) qs.set(k, Array.isArray(v) ? v[0] : v);
  }
  const filterHref = `/filter?${qs.toString()}`;

  return (
    <div className="h-screen overflow-y-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white pb-24 font-sans [&::-webkit-scrollbar]:hidden">
      <HomeHeader />

      <main className="px-4 mt-2">
        {filtering ? (
          <FilteredResults placeLists={filtered} filters={filters} filterHref={filterHref} />
        ) : (
          <>
            <RecentPlaceLists placeLists={savedPlaceLists} />
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
