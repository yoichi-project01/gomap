'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

export default function CollectionMap({ spots }: Props) {
  if (!spots || spots.length === 0) return null;

  // 最初の地点を中心に設定
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