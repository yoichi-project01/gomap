'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export type PinResult = {
  lat: number;
  lng: number;
  address: string;
  prefecture: string | null;
};

export type FlyTarget = {
  lat: number;
  lng: number;
  key: number;
};

type Props = {
  onPinChange: (result: PinResult | null) => void;
  flyTarget?: FlyTarget | null;
};

const PIN_ICON = L.divIcon({
  html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#22c55e;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; prefecture: string | null }> {
  const res = await fetch(`/api/places/reverse?lat=${lat}&lng=${lng}`);
  if (!res.ok) return { address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, prefecture: null };
  const json = await res.json() as { address: string; prefecture: string | null };
  return json;
}

function FlyTo({ target }: { target: FlyTarget }) {
  const map = useMap();
  const prevKey = useRef<number | null>(null);
  useEffect(() => {
    if (prevKey.current === target.key) return;
    prevKey.current = target.key;
    map.flyTo([target.lat, target.lng], 17, { duration: 1 });
  }, [map, target]);
  return null;
}

function ClickHandler({ onPinChange }: { onPinChange: (result: PinResult | null) => void }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const geo = await reverseGeocode(lat, lng);
      onPinChange({ lat, lng, address: geo.address, prefecture: geo.prefecture });
    },
  });
  return null;
}

function DraggableMarker({
  lat,
  lng,
  onPinChange,
}: {
  lat: number;
  lng: number;
  onPinChange: (result: PinResult | null) => void;
}) {
  return (
    <Marker
      position={[lat, lng]}
      icon={PIN_ICON}
      draggable
      eventHandlers={{
        async dragend(e) {
          const { lat: newLat, lng: newLng } = (e.target as L.Marker).getLatLng();
          const geo = await reverseGeocode(newLat, newLng);
          onPinChange({ lat: newLat, lng: newLng, address: geo.address, prefecture: geo.prefecture });
        },
      }}
    />
  );
}

export default function MapPinSelector({ onPinChange, flyTarget }: Props) {
  return (
    <MapContainer
      center={[35.6812, 139.7671]}
      zoom={13}
      className="h-full w-full"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPinChange={onPinChange} />
      {flyTarget && <FlyTo target={flyTarget} />}
    </MapContainer>
  );
}

export function MapPinSelectorWithMarker({
  pinLat,
  pinLng,
  onPinChange,
  flyTarget,
}: {
  pinLat: number;
  pinLng: number;
  onPinChange: (result: PinResult | null) => void;
  flyTarget?: FlyTarget | null;
}) {
  return (
    <MapContainer
      center={[pinLat, pinLng]}
      zoom={17}
      className="h-full w-full"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPinChange={onPinChange} />
      <DraggableMarker lat={pinLat} lng={pinLng} onPinChange={onPinChange} />
      {flyTarget && <FlyTo target={flyTarget} />}
    </MapContainer>
  );
}
