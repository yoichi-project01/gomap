'use client';

import dynamic from 'next/dynamic';
import type { Spot } from '@/types/spot';

const PlaceListMap = dynamic(() => import('@/components/PlaceListMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-800 animate-pulse flex items-center justify-center text-zinc-500">地図を読み込み中...</div>
});

type Props = {
  spots: Spot[];
};

export default function PlaceListMapWrapper({ spots }: Props) {
  return <PlaceListMap spots={spots} />;
}
