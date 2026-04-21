"use client"

import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { Spot } from "@/types/spot"
import { useEffect } from "react"

// Webpack + Leaflet のデフォルトマーカーアイコン問題を修正
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const OSAKA_CENTER: [number, number] = [34.7, 135.5]

export type LeafletMapProps = {
  spots: Spot[]
  center?: [number, number]
  fitBounds?: boolean
  selectedSpot?: Spot | null
  onMarkerClick?: (spot: Spot) => void
}

type Props = LeafletMapProps

// マップにフィットする処理をするコンポーネント
function MapFitter({ spots, center, fitBounds, selectedSpot }: Omit<Props, 'onMarkerClick'>) {
  const map = useMap()

  useEffect(() => {
    if (selectedSpot) {
      // 選択されたスポットにズーム
      map.setView([selectedSpot.lat, selectedSpot.lng], 15)
    } else if (fitBounds && spots.length > 0) {
      const bounds = L.latLngBounds(spots.map(spot => [spot.lat, spot.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (center) {
      map.setView(center, 13)
    }
  }, [map, spots, center, fitBounds, selectedSpot])

  return null
}

export default function LeafletMap({ spots, center, fitBounds, selectedSpot, onMarkerClick }: Props) {
  const mapCenter = center || OSAKA_CENTER
  return (
    <MapContainer center={mapCenter} zoom={13} className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFitter spots={spots} center={center} fitBounds={fitBounds} selectedSpot={selectedSpot} />
      {spots.map((spot) => (
        <Marker 
          key={spot.id} 
          position={[spot.lat, spot.lng]}
          eventHandlers={{
            click: () => onMarkerClick?.(spot),
          }}
        >
          <Popup>
            <strong>{spot.name}</strong>
            {spot.description && (
              <p style={{ margin: "6px 0 0", fontSize: "0.85em", color: "#555" }}>
                {spot.description}
              </p>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
