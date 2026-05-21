'use client'

import { useCallback, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

export type PinResult = {
  lat: number
  lng: number
  address: string
  prefecture: string | null
}

export type FlyTarget = {
  lat: number
  lng: number
  key: number // 同じ座標に再フライするときも key を変えて強制発火
}

type Props = {
  onPinChange: (result: PinResult | null) => void
  flyTarget?: FlyTarget | null
}

const DEFAULT_CENTER: [number, number] = [35.6762, 139.6503] // 東京
const DEFAULT_ZOOM = 10

const pinIcon = L.divIcon({
  html: `<div style="width:28px;height:40px;display:flex;flex-direction:column;align-items:center">
    <div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#22c55e;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>
  </div>`,
  className: '',
  iconSize: [28, 40],
  iconAnchor: [14, 40],
})

function ClickHandler({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPlace(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyTo({ target }: { target: FlyTarget }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([target.lat, target.lng], 17, { duration: 1 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.key]) // key が変わったときだけフライ
  return null
}

export default function MapPinSelector({ onPinChange, flyTarget }: Props) {
  const [pinPos, setPinPos] = useState<{ lat: number; lng: number } | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsGeocoding(true)
      try {
        const res = await fetch(`/api/places/reverse?lat=${lat}&lng=${lng}`)
        const json = (await res.json()) as { address?: string; prefecture?: string | null }
        onPinChange({
          lat,
          lng,
          address: json.address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          prefecture: json.prefecture ?? null,
        })
      } catch {
        onPinChange({
          lat,
          lng,
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          prefecture: null,
        })
      } finally {
        setIsGeocoding(false)
      }
    },
    [onPinChange],
  )

  function handlePlace(lat: number, lng: number) {
    setPinPos({ lat, lng })
    reverseGeocode(lat, lng)
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPlace={handlePlace} />
        {flyTarget && <FlyTo target={flyTarget} />}
        {pinPos && (
          <Marker
            position={[pinPos.lat, pinPos.lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = (e.target as L.Marker).getLatLng()
                handlePlace(lat, lng)
              },
            }}
          />
        )}
      </MapContainer>

      {!pinPos && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-[400]">
          <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            マップをタップして場所を指定
          </span>
        </div>
      )}

      {isGeocoding && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full z-[400] whitespace-nowrap">
          住所を取得中…
        </div>
      )}
    </div>
  )
}
