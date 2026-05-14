'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export type Location = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type Props = {
  locations: Location[];
};

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;
    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 });
  }, [map, locations]);

  return null;
}

export default function SpotMiniMap({ locations }: Props) {
  // ピンが1つもない場合のフォールバック
  if (!locations || locations.length === 0) return null;

  // FitBounds で全スポットが収まるよう自動調整される
  const centerPosition: [number, number] = [locations[0].lat, locations[0].lng];

  return (
    <MapContainer
      center={centerPosition}
      zoom={12}
      className="h-full w-full z-0"
      zoomControl={false} // ミニマップなので操作パネルは隠す
      dragging={false} // スクロールの邪魔にならないようドラッグ操作を無効化
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds locations={locations} />

      {/* スポットに含まれる全ての地点にピンを刺す */}
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon} />
      ))}
    </MapContainer>
  );
}