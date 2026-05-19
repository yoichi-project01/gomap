'use client';

import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { BBox } from '@/lib/filter/placeLists';

type Props = {
  initialCenter?: [number, number];
  initialZoom?: number;
  initialBBox?: BBox | null; // 復元用 (URL クエリ等から渡された範囲)
  onBoundsChange: (bbox: BBox) => void;
};

// 移動/ズーム完了時に現在の表示範囲を親に通知
function BoundsTracker({ onBoundsChange }: { onBoundsChange: (b: BBox) => void }) {
  const map = useMapEvents({
    moveend: () => emit(),
    zoomend: () => emit(),
  });

  function emit() {
    const b = map.getBounds();
    onBoundsChange({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });
  }

  // マウント直後にも 1 度通知 (初期 bbox を親に伝える)
  useEffect(() => {
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// URL クエリ等から復元された bbox に初期フィット
function FitInitialBBox({ bbox }: { bbox: BBox | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!bbox) return;
    map.fitBounds(
      [
        [bbox.south, bbox.west],
        [bbox.north, bbox.east],
      ],
      { padding: [20, 20] },
    );
    // 初回マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function FilterMap({
  initialCenter = [35.6762, 139.6503], // 東京駅近辺をデフォルト中心に
  initialZoom = 10,
  initialBBox,
  onBoundsChange,
}: Props) {
  return (
    <div className="h-64 w-full">
      <MapContainer center={initialCenter} zoom={initialZoom} className="h-full w-full z-0">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitInitialBBox bbox={initialBBox} />
        <BoundsTracker onBoundsChange={onBoundsChange} />
      </MapContainer>
    </div>
  );
}
