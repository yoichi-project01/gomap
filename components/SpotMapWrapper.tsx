'use client';

import dynamic from 'next/dynamic';

// ここで動的インポート（SSR回避）を行う
const SpotDetailMap = dynamic(() => import('@/components/SpotDetailMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-800 animate-pulse" />
});

type Props = {
  lat: number;
  lng: number;
  name: string;
};

export default function SpotMapWrapper(props: Props) {
  return <SpotDetailMap {...props} />;
}