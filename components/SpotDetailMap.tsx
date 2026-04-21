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

type Props = {
  lat: number;
  lng: number;
  name: string;
};

export default function SpotDetailMap({ lat, lng, name }: Props) {
  const position: [number, number] = [lat, lng];

  return (
    <MapContainer 
      center={position} 
      zoom={16} 
      className="h-full w-full z-0"
      zoomControl={false} // デザイン重視のためデフォルトのズームをオフ
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* ここで地図にピンを刺します */}
      <Marker position={position} icon={customIcon}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}