"use client"

import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { Spot } from "@/types/spot"

// Webpack + Leaflet のデフォルトマーカーアイコン問題を修正
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const OSAKA_CENTER: [number, number] = [34.7, 135.5]

type Props = {
  spots: Spot[]
}

export default function LeafletMap({ spots }: Props) {
  return (
    <MapContainer center={OSAKA_CENTER} zoom={13} className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {spots.map((spot) => (
        <Marker key={spot.id} position={[spot.lat, spot.lng]}>
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
