'use client';

import dynamic from 'next/dynamic';

type Location = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

// ここで動的インポート（SSR回避）を行う
const CollectionMap = dynamic(() => import('@/components/CollectionMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-800 animate-pulse" />
});

type Props = {
  locations: Location[];
};

export default function CollectionMapWrapper(props: Props) {
  return <CollectionMap {...props} />;
}