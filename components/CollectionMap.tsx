'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Location } from './SpotMiniMap'; // 先ほど定義した型を再利用

const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Props = {
  locations: Location[];
};

export default function CollectionMap({ locations }: Props) {
  if (!locations || locations.length === 0) return null;

  // 最初の地点を中心に設定
  const centerPosition: [number, number] = [locations[0].lat, locations[0].lng];

  return (
    <MapContainer 
      center={centerPosition} 
      zoom={13} 
      className="h-full w-full z-0"
      // 詳細画面なのでズームやドラッグ操作を許可します（デフォルトのまま）
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
          <Popup className="font-bold text-center">
            {loc.name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}