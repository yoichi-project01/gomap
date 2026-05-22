import { Library } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { listSavedPlaceLists } from '@/lib/server/saves';
import SavedPlaceListsView from './SavedPlaceListsView';

export const dynamic = 'force-dynamic';

export default async function SavedPlaceListsPage() {
  const placeLists = await listSavedPlaceLists();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <BackButton
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3"
          iconClassName="w-6 h-6 text-zinc-700 dark:text-white"
        />
        <Library className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">保存したプレイスリスト</h1>
      </header>

      <main className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">保存済みのプレイスリスト</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{placeLists.length}件</span>
        </div>

        <SavedPlaceListsView initialPlaceLists={placeLists} />
      </main>
    </div>
  );
}
