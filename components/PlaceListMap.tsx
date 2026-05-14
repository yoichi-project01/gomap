'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Spot } from '@/types/spot'; // LocationではなくSpotをインポート

const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Props = {
  spots: Spot[]; // locations から spots に変更
};

function FitBounds({ spots }: { spots: Spot[] }) {
  const map = useMap();

  useEffect(() => {
    if (spots.length === 0) return;
    if (spots.length === 1) {
      map.setView([spots[0].lat, spots[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(spots.map((s) => [s.lat, s.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [map, spots]);

  return null;
}

export default function PlaceListMap({ spots }: Props) {
  if (!spots || spots.length === 0) return null;

  // 最初の地点を初期センターに設定（FitBoundsで全体を表示するように再フィットされる）
  const centerPosition: [number, number] = [spots[0].lat, spots[0].lng];

  return (
    <MapContainer
      center={centerPosition}
      zoom={13}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds spots={spots} />
      {spots.map((spot) => (
        <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={customIcon}>
          <Popup className="font-bold text-center">
            {spot.name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}