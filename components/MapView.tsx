"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

type LatLng = { lat: number; lng: number };

export default function MapView() {
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("このブラウザは現在地取得に対応していません");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setError("現在地の取得に失敗しました。位置情報の許可を確認してください。");
      }
    );
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!currentPosition) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        現在地を取得中...
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={currentPosition}
        defaultZoom={15}
        mapId="gomap-main"
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        <AdvancedMarker position={currentPosition} title="現在地" />
      </Map>
    </APIProvider>
  );
}
