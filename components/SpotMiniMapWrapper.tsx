'use client';

import dynamic from 'next/dynamic';
import { Location } from './SpotMiniMap';

const SpotMiniMap = dynamic(() => import('@/components/SpotMiniMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-800 animate-pulse" />
});

type Props = {
  locations: Location[];
};

export default function SpotMiniMapWrapper({ locations }: Props) {
  return <SpotMiniMap locations={locations} />;
}