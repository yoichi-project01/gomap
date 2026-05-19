'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Spot } from '@/types/spot';

// 単独ピン: 緑のティアドロップ + 中央に白い丸。クラスタと同じビジュアル言語で統一。
// tooltipAnchor は iconAnchor からの相対座標。
// [0, -40] = アイコン上端 (ピン本体の頭) に Tooltip 開始点を置き、ラベルがピンに被らないようにする。
const customIcon = L.divIcon({
  className: 'spot-picker-pin-wrapper',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
    <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 40 16 40 C16 40 32 28 32 16 C32 7.16 24.84 0 16 0 Z" fill="#16a34a"/>
    <circle cx="16" cy="16" r="5" fill="#fff"/>
  </svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
  tooltipAnchor: [0, -40],
});

export type FocusTarget = { spot: Spot; key: number };

type Props = {
  spots: Spot[];
  refitKey: string; // フィルタが変わったときだけ再フィットさせるためのキー
  focused: FocusTarget | null; // リスト行クリック等でズームしたいスポット
  onAdd: (spot: Spot) => void;
};

// refitKey が変わったタイミングだけ表示範囲を再フィット。
// spots だけの変化 (追加してピンが減るなど) では動かない (ユーザの視点を保持)。
function FitBounds({ spots, refitKey }: { spots: Spot[]; refitKey: string }) {
  const map = useMap();
  const spotsRef = useRef(spots);
  spotsRef.current = spots;

  useEffect(() => {
    const current = spotsRef.current;
    if (current.length === 0) return;
    if (current.length === 1) {
      map.setView([current[0].lat, current[0].lng], 13);
      return;
    }
    const bounds = L.latLngBounds(current.map((s) => [s.lat, s.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  }, [map, refitKey]);

  return null;
}

// focused が変わったらその座標へズーム。key が変わるたびに発火するので、
// 同じスポットを連続クリックしても再センターできる。
function FocusOn({ focused }: { focused: FocusTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (!focused) return;
    map.flyTo([focused.spot.lat, focused.spot.lng], 16, { duration: 0.5 });
  }, [map, focused]);
  return null;
}

// 現在ズームを親へ通知 (ラベル表示の閾値判定に使う)
function ZoomTracker({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoom(map.getZoom());
    const handler = () => onZoom(map.getZoom());
    map.on('zoomend', handler);
    return () => {
      map.off('zoomend', handler);
    };
  }, [map, onZoom]);
  return null;
}

// このズーム以上だと各ピンの名前ラベルを表示。これ未満では件数バッジに集約。
const LABEL_ZOOM_THRESHOLD = 14;

// 緯度経度のグリッドでクラスタリング。zoom が小さいほどセルを大きくして、
// 密集ピンを 1 つのクラスタにまとめる。LABEL_ZOOM_THRESHOLD 以上では一切まとめない。
type Cluster = { id: string; lat: number; lng: number; spots: Spot[] };

function clusterByGrid(spots: Spot[], zoom: number): Cluster[] {
  if (zoom >= LABEL_ZOOM_THRESHOLD) {
    return spots.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, spots: [s] }));
  }
  // セルサイズ: zoom が 1 上がるごとに半分。zoom 11 で約 0.35°(~38km)、zoom 13 で約 0.09°(~10km)
  const gridSize = 720 / Math.pow(2, zoom + 1);
  const cells = new Map<string, Spot[]>();
  for (const spot of spots) {
    const cx = Math.floor(spot.lat / gridSize);
    const cy = Math.floor(spot.lng / gridSize);
    const key = `${cx}:${cy}`;
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

// クラスタアイコン: 単独ピンと同じティアドロップ形状で、上部の白丸に件数を表示。
// 件数によってサイズ・フォントサイズを段階的に拡大して視認性を確保。
function makeClusterIcon(count: number): L.DivIcon {
  const width = count < 10 ? 48 : count < 50 ? 58 : 68;
  const height = Math.round((width * 60) / 48); // アスペクト比固定 (48:60)
  const fontSize = count < 10 ? 17 : count < 100 ? 15 : 13;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60" width="${width}" height="${height}">
    <!-- 外側のティアドロップ (緑) -->
    <path d="M24 0 C10.75 0 0 10.75 0 24 C0 42 24 60 24 60 C24 60 48 42 48 24 C48 10.75 37.25 0 24 0 Z" fill="#16a34a"/>
    <!-- 内側の細い緑リング (深みを出すため一段濃い緑) -->
    <path d="M24 3 C12.4 3 3 12.4 3 24 C3 39.9 24 56 24 56 C24 56 45 39.9 45 24 C45 12.4 35.6 3 24 3 Z" fill="none" stroke="#15803d" stroke-width="1"/>
    <!-- 件数を入れる白い円 -->
    <circle cx="24" cy="22" r="14" fill="#fff"/>
    <!-- 件数 -->
    <text x="24" y="22" text-anchor="middle" dominant-baseline="central"
          font-size="${fontSize}" font-weight="800" fill="#15803d"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">${count}</text>
  </svg>`;
  return L.divIcon({
    className: 'spot-picker-cluster-wrapper',
    html: svg,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  });
}

function ClusterMarker({ cluster, currentZoom }: { cluster: Cluster; currentZoom: number }) {
  const map = useMap();
  return (
    <Marker
      position={[cluster.lat, cluster.lng]}
      icon={makeClusterIcon(cluster.spots.length)}
      eventHandlers={{
        click: () => {
          // クラスタをタップで 2 段階ズームイン (最大 16)。展開を促す。
          map.flyTo([cluster.lat, cluster.lng], Math.min(currentZoom + 2, 16), {
            duration: 0.5,
          });
        },
      }}
    />
  );
}

export default function SpotPickerMap({ spots, refitKey, focused, onAdd }: Props) {
  const [zoom, setZoom] = useState<number | null>(null);

  // クラスタリングは現在ズームに依存する。zoom が未設定なら初期 zoom (11) で計算しておく
  const effectiveZoom = zoom ?? 11;
  const clusters = useMemo(
    () => clusterByGrid(spots, effectiveZoom),
    [spots, effectiveZoom],
  );

  if (spots.length === 0) {
    return (
      <div className="h-48 lg:h-96 w-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
        該当するスポットがありません
      </div>
    );
  }

  // 1 件しか無いときはクラッタしないので常にラベル表示。複数なら zoom 閾値で判定。
  const showLabels =
    spots.length <= 1 || (zoom !== null && zoom >= LABEL_ZOOM_THRESHOLD);

  const center: [number, number] = [spots[0].lat, spots[0].lng];

  return (
    <div className="relative h-48 lg:h-96 w-full">
      <MapContainer center={center} zoom={11} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds spots={spots} refitKey={refitKey} />
        <FocusOn focused={focused} />
        <ZoomTracker onZoom={setZoom} />
        {clusters.map((cluster) => {
          // クラスタが 1 件 = 通常のマーカー (ラベル + Popup 付き)
          if (cluster.spots.length === 1) {
            const spot = cluster.spots[0];
            return (
              <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={customIcon}>
                {showLabels && (
                  <Tooltip permanent direction="top" className="spot-picker-label">
                    {spot.name}
                  </Tooltip>
                )}
                <Popup>
                  <div className="font-bold text-sm mb-1">{spot.name}</div>
                  {spot.description && (
                    <div className="text-xs text-zinc-600 mb-2">{spot.description}</div>
                  )}
                  <button
                    type="button"
                    onClick={() => onAdd(spot)}
                    className="bg-green-500 text-black font-bold text-xs px-3 py-1 rounded-full hover:bg-green-400 transition"
                  >
                    + 追加
                  </button>
                </Popup>
              </Marker>
            );
          }
          // 複数件 = クラスタアイコン (タップで拡大)
          return (
            <ClusterMarker key={cluster.id} cluster={cluster} currentZoom={effectiveZoom} />
          );
        })}
      </MapContainer>
      {/* 総合計バッジ (常時表示) */}
      <div className="absolute top-2 right-2 z-[400] bg-zinc-900/90 text-white font-bold text-xs px-3 py-1 rounded-full border border-zinc-700 shadow-lg pointer-events-none">
        総 {spots.length} 件
      </div>
    </div>
  );
}
