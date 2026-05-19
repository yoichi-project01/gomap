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

const PREFECTURES = [
  "北海道",
  "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

// Nominatim の address.state が空のことがあるので、display_name (例: "..., 大阪府, 530-0012, 日本")
// からも 47 都道府県名のいずれかを拾えるようにフォールバックする。
function extractPrefecture(item: NominatimResult): string | null {
  if (item.address?.state) return item.address.state
  const dn = item.display_name ?? ""
  return PREFECTURES.find((p) => dn.includes(p)) ?? null
}

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
        prefecture: extractPrefecture(item),
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
