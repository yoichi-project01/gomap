'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { PlaceSearchResult } from '@/app/api/places/search/route';

type Props = {
  results: PlaceSearchResult[];
  onSelect: (result: PlaceSearchResult) => void;
};

function FitBounds({ results }: { results: PlaceSearchResult[] }) {
  const map = useMap();
  useEffect(() => {
    if (results.length === 0) return;
    if (results.length === 1) {
      map.setView([results[0].lat, results[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(results.map((r) => [r.lat, r.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [map, results]);
  return null;
}

function makeNumberedIcon(index: number) {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:#22c55e;color:#000;font-weight:700;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.6)">${index + 1}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function PlaceSearchMap({ results, onSelect }: Props) {
  if (results.length === 0) return null;

  const center: [number, number] = [results[0].lat, results[0].lng];

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds results={results} />
      {results.map((r, i) => (
        <Marker
          key={r.placeId}
          position={[r.lat, r.lng]}
          icon={makeNumberedIcon(i)}
          eventHandlers={{ click: () => onSelect(r) }}
        />
      ))}
    </MapContainer>
  );
}
