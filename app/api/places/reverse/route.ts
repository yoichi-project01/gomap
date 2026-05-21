import { NextRequest, NextResponse } from "next/server"

// Nominatim (OpenStreetMap) 逆ジオコーディングプロキシ
// 緯度経度 → 日本語住所・都道府県を返す

const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"

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

// Nominatim の addressdetails=1 で返ってくる address オブジェクト
type NominatimAddress = {
  house_number?: string   // 番地  例: "19-1"
  road?: string           // 道路・丁目  例: "歌舞伎町一丁目"
  neighbourhood?: string  // 町域
  quarter?: string        // 地区
  suburb?: string         // 地区  例: "歌舞伎町"
  city_district?: string  // 区（政令市内の区）例: "北区"
  city?: string           // 市・区  例: "新宿区"
  town?: string           // 町
  village?: string        // 村
  hamlet?: string         // 集落
  county?: string         // 郡
  state?: string          // 都道府県  例: "東京都"
  postcode?: string
  country?: string
}

type NominatimReverseResult = {
  display_name: string
  address?: NominatimAddress
}

function extractPrefecture(addr: NominatimAddress | undefined, displayName: string): string | null {
  if (addr?.state) return addr.state
  return PREFECTURES.find((p) => displayName.includes(p)) ?? null
}

/**
 * Nominatim の address オブジェクトから日本語住所を組み立てる。
 * 「都道府県 → 市区町村 → 地区 → 丁目 → 番地」の順に並べ、
 * 上位の部品がすでに下位に含まれる場合は重複を除去する。
 */
function buildJapaneseAddress(addr: NominatimAddress, fallback: string): string {
  // 詳細度: 小 → 大 の順でリストアップ（後で逆順にする）
  const raw = [
    addr.house_number,
    addr.road,
    addr.neighbourhood,
    addr.suburb ?? addr.quarter,
    addr.city_district,
    addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? addr.county,
    addr.state,
  ].filter((p): p is string => typeof p === "string" && p.length > 0)

  if (raw.length === 0) return fallback

  // 大→小の順にする
  const parts = raw.reverse()
  const deduped: string[] = []

  for (const part of parts) {
    // 既に組み立てた文字列がこの部品を含む場合はスキップ
    if (deduped.join("").includes(part)) continue
    // この部品がより粗い既存部品を包含する場合は、その粗い部品を削除して置き換え
    const next = deduped.filter((d) => !part.includes(d))
    next.push(part)
    deduped.length = 0
    deduped.push(...next)
  }

  return deduped.join("")
}

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat")
  const lng = req.nextUrl.searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 })
  }

  const url = new URL(NOMINATIM_REVERSE_URL)
  url.searchParams.set("lat", lat)
  url.searchParams.set("lon", lng)
  url.searchParams.set("format", "json")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("zoom", "18")       // 建物レベルの詳細度
  url.searchParams.set("accept-language", "ja")

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "gomap/0.1.0 (dev)" },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `サービスから応答がありません (${res.status})` },
        { status: 502 }
      )
    }

    const data = (await res.json()) as NominatimReverseResult
    const addr = data.address ?? {}

    return NextResponse.json({
      address: buildJapaneseAddress(addr, data.display_name),
      prefecture: extractPrefecture(addr, data.display_name),
    })
  } catch (error) {
    console.error("[GET /api/places/reverse]", error)
    return NextResponse.json({ error: "住所の取得に失敗しました" }, { status: 500 })
  }
}
