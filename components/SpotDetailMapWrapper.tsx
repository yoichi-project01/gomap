'use client';

import dynamic from 'next/dynamic';

const SpotDetailMap = dynamic(() => import('@/components/SpotDetailMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />,
});

type Props = {
  lat: number;
  lng: number;
  name: string;
};

export default function SpotDetailMapWrapper(props: Props) {
  return <SpotDetailMap {...props} />;
}
