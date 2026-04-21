'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

export default function SpotMiniMap({ locations }: Props) {
  // ピンが1つもない場合のフォールバック（大阪中心部）
  if (!locations || locations.length === 0) return null;

  // 簡易的に、配列の最初の地点を中心に設定します（ズームを少し引いて全体を見せる）
  const centerPosition: [number, number] = [locations[0].lat, locations[0].lng];

  return (
    <MapContainer 
      center={centerPosition} 
      zoom={12} // 複数のピンが見えるように少し引いたズーム倍率
      className="h-full w-full z-0"
      zoomControl={false} // ミニマップなので操作パネルは隠す
      dragging={false} // スクロールの邪魔にならないようドラッグ操作を無効化
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* スポットに含まれる全ての地点にピンを刺す */}
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon} />
      ))}
    </MapContainer>
  );
}