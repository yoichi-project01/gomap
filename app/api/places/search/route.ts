import { NextRequest, NextResponse } from "next/server"

// Nominatim (OpenStreetMap) を経由する場所検索プロキシ
// dev 用途想定。本番運用するなら Google Places / Mapbox など有償の API に差し替え

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

type NominatimResult = {
  place_id: number | string
  lat: string
  lon: string
  display_name: string
  name?: string
  address?: {
    amenity?: string
    state?: string
    city?: string
    town?: string
  }
}

export type PlaceSearchResult = {
  placeId: string
  name: string
  address: string
  prefecture: string | null
  lat: number
  lng: number
}

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q) return NextResponse.json({ results: [] satisfies PlaceSearchResult[] })

  const url = new URL(NOMINATIM_URL)
  url.searchParams.set("q", q)
  url.searchParams.set("format", "json")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("limit", "10")
  url.searchParams.set("countrycodes", "jp")
  url.searchParams.set("accept-language", "ja")

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "gomap/0.1.0 (dev)" },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { results: [], error: `検索サービスから応答がありません (${res.status})` },
        { status: 502 }
      )
    }

    const data = (await res.json()) as NominatimResult[]

    const results: PlaceSearchResult[] = data.map((item) => {
      const primary = item.name || item.address?.amenity || item.display_name.split(",")[0]?.trim() || "(無題)"
      return {
        placeId: String(item.place_id),
        name: primary,
        address: item.display_name,
        prefecture: item.address?.state ?? null,
        lat: Number(item.lat),
        lng: Number(item.lon),
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[GET /api/places/search]", error)
    return NextResponse.json({ results: [], error: "場所検索に失敗しました" }, { status: 500 })
  }
}
