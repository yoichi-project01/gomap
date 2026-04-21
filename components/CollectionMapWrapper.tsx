'use client';

import dynamic from 'next/dynamic';
import { Location } from './SpotMiniMap';

const CollectionMap = dynamic(() => import('@/components/CollectionMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-800 animate-pulse flex items-center justify-center text-zinc-500">地図を読み込み中...</div>
});

type Props = {
  locations: Location[];
};

export default function CollectionMapWrapper({ locations }: Props) {
  return <CollectionMap locations={locations} />;
}