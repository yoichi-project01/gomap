'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { BBox } from '@/lib/filter/placeLists';
import type { Spot } from '@/types/spot';

const pinIcon = L.divIcon({
  className: 'filter-map-pin',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
    <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 40 16 40 C16 40 32 28 32 16 C32 7.16 24.84 0 16 0 Z" fill="#16a34a"/>
    <circle cx="16" cy="16" r="5" fill="#fff"/>
  </svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
  tooltipAnchor: [0, -40],
});

function makeClusterIcon(count: number): L.DivIcon {
  const width = count < 10 ? 48 : count < 50 ? 58 : 68;
  const height = Math.round((width * 60) / 48);
  const fontSize = count < 10 ? 17 : count < 100 ? 15 : 13;
  return L.divIcon({
    className: 'filter-map-cluster',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60" width="${width}" height="${height}">
      <path d="M24 0 C10.75 0 0 10.75 0 24 C0 42 24 60 24 60 C24 60 48 42 48 24 C48 10.75 37.25 0 24 0 Z" fill="#16a34a"/>
      <path d="M24 3 C12.4 3 3 12.4 3 24 C3 39.9 24 56 24 56 C24 56 45 39.9 45 24 C45 12.4 35.6 3 24 3 Z" fill="none" stroke="#15803d" stroke-width="1"/>
      <circle cx="24" cy="22" r="14" fill="#fff"/>
      <text x="24" y="22" text-anchor="middle" dominant-baseline="central"
            font-size="${fontSize}" font-weight="800" fill="#15803d"
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">${count}</text>
    </svg>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  });
}

const LABEL_ZOOM = 14;

type Cluster = { id: string; lat: number; lng: number; spots: Spot[] };

function clusterByGrid(spots: Spot[], zoom: number): Cluster[] {
  if (zoom >= LABEL_ZOOM) {
    return spots.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, spots: [s] }));
  }
  const gridSize = 720 / Math.pow(2, zoom + 1);
  const cells = new Map<string, Spot[]>();
  for (const spot of spots) {
    const key = `${Math.floor(spot.lat / gridSize)}:${Math.floor(spot.lng / gridSize)}`;
    const arr = cells.get(key) ?? [];
    arr.push(spot);
    cells.set(key, arr);
  }
  const result: Cluster[] = [];
  for (const [key, group] of cells.entries()) {
    if (group.length === 1) {
      const s = group[0];
      result.push({ id: s.id, lat: s.lat, lng: s.lng, spots: group });
    } else {
      const lat = group.reduce((sum, s) => sum + s.lat, 0) / group.length;
      const lng = group.reduce((sum, s) => sum + s.lng, 0) / group.length;
      result.push({ id: `cluster:${key}`, lat, lng, spots: group });
    }
  }
  return result;
}

function BoundsTracker({ onBoundsChange }: { onBoundsChange: (b: BBox) => void }) {
  const map = useMapEvents({
    moveend: () => emit(),
    zoomend: () => emit(),
  });

  function emit() {
    const b = map.getBounds();
    onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
  }

  useEffect(() => {
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function FitInitialBBox({ bbox }: { bbox: BBox | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!bbox) return;
    map.fitBounds([[bbox.south, bbox.west], [bbox.north, bbox.east]], { padding: [20, 20] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function ZoomTracker({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoom(map.getZoom());
    const handler = () => onZoom(map.getZoom());
    map.on('zoomend', handler);
    return () => { map.off('zoomend', handler); };
  }, [map, onZoom]);
  return null;
}

function ClusterMarker({ cluster, zoom }: { cluster: Cluster; zoom: number }) {
  const map = useMap();
  return (
    <Marker
      position={[cluster.lat, cluster.lng]}
      icon={makeClusterIcon(cluster.spots.length)}
      eventHandlers={{
        click: () => map.flyTo([cluster.lat, cluster.lng], Math.min(zoom + 2, 16), { duration: 0.5 }),
      }}
    />
  );
}

type Props = {
  initialCenter?: [number, number];
  initialZoom?: number;
  initialBBox?: BBox | null;
  spots?: Spot[];
  onBoundsChange: (bbox: BBox) => void;
};

export default function FilterMap({
  initialCenter = [35.6762, 139.6503],
  initialZoom = 10,
  initialBBox,
  spots = [],
  onBoundsChange,
}: Props) {
  const [zoom, setZoom] = useState(initialZoom);
  const clusters = useMemo(() => clusterByGrid(spots, zoom), [spots, zoom]);
  const showLabels = zoom >= LABEL_ZOOM;

  return (
    <div className="relative h-64 w-full">
      <MapContainer center={initialCenter} zoom={initialZoom} className="h-full w-full z-0">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitInitialBBox bbox={initialBBox} />
        <BoundsTracker onBoundsChange={onBoundsChange} />
        <ZoomTracker onZoom={setZoom} />
        {clusters.map((cluster) => {
          if (cluster.spots.length === 1) {
            const spot = cluster.spots[0];
            return (
              <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={pinIcon}>
                {showLabels && (
                  <Tooltip permanent direction="top" className="spot-picker-label">
                    {spot.name}
                  </Tooltip>
                )}
                <Popup>
                  <div className="font-bold text-sm">{spot.name}</div>
                  {spot.prefecture && <div className="text-xs text-zinc-500 mt-0.5">{spot.prefecture}</div>}
                </Popup>
              </Marker>
            );
          }
          return <ClusterMarker key={cluster.id} cluster={cluster} zoom={zoom} />;
        })}
      </MapContainer>
      {spots.length > 0 && (
        <div className="absolute top-2 right-2 z-[400] bg-zinc-900/90 text-white font-bold text-xs px-3 py-1 rounded-full border border-zinc-700 shadow-lg pointer-events-none">
          {spots.length} スポット
        </div>
      )}
    </div>
  );
}
