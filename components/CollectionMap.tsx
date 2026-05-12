'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Next.js環境でのLeafletアイコン表示エラーを回避する設定
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Location = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type Props = {
  locations: Location[];
};

export default function CollectionMap({ locations }: Props) {
  if (locations.length === 0) {
    return <div className="h-full w-full bg-zinc-800 flex items-center justify-center text-zinc-400">地図データがありません</div>;
  }

  // 最初の場所を中心とする
  const center: [number, number] = [locations[0].lat, locations[0].lng];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full z-0"
      zoomControl={false} // デザイン重視のためデフォルトのズームをオフ
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* 複数の場所にピンを刺す */}
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
          icon={customIcon}
        >
          <Popup>{location.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}