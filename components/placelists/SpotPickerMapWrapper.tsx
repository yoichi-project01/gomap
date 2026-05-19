'use client';

import dynamic from 'next/dynamic';
import type { Spot } from '@/types/spot';

const SpotPickerMap = dynamic(() => import('@/components/placelists/SpotPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-48 lg:h-96 w-full bg-zinc-800 animate-pulse flex items-center justify-center text-xs text-zinc-500">
      地図を読み込み中...
    </div>
  ),
});

export type FocusTarget = { spot: Spot; key: number };

type Props = {
  spots: Spot[];
  refitKey: string;
  focused: FocusTarget | null;
  onAdd: (spot: Spot) => void;
};

export default function SpotPickerMapWrapper({ spots, refitKey, focused, onAdd }: Props) {
  return <SpotPickerMap spots={spots} refitKey={refitKey} focused={focused} onAdd={onAdd} />;
}
