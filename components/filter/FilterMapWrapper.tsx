'use client';

import dynamic from 'next/dynamic';
import type { BBox } from '@/lib/filter/placeLists';
import type { Spot } from '@/types/spot';

const FilterMap = dynamic(() => import('@/components/filter/FilterMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center text-xs text-zinc-500">
      地図を読み込み中...
    </div>
  ),
});

type Props = {
  initialCenter?: [number, number];
  initialZoom?: number;
  initialBBox?: BBox | null;
  spots?: Spot[];
  onBoundsChange: (bbox: BBox) => void;
};

export default function FilterMapWrapper(props: Props) {
  return <FilterMap {...props} />;
}
