'use client';

import dynamic from 'next/dynamic';

// クライアントコンポーネント内であれば ssr: false が使えます
const MapApp = dynamic(() => import('@/components/MapApp'), { 
  ssr: false,
  loading: () => <div className="h-screen w-full bg-gray-100 animate-pulse" />
});

export default function MapWrapper() {
  return <MapApp />;
}