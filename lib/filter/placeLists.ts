import type { PlaceList, Spot } from "@/types/spot"

export type SortOrder = "登録が新しい順" | "登録が古い順" | "距離が近い順" | "人気順"

// 作成日の期間絞り込み
export type CreatedSince = "week" | "month" | "year"

// マップの表示範囲 (north/south/east/west の lat/lng 境界)
export type BBox = { north: number; south: number; east: number; west: number }

export type PlaceListFilters = {
  pref?: string
  cats?: string[]
  query?: string
  distance?: string
  coords?: { lat: number; lng: number } | null
  order?: SortOrder
  showAll?: boolean
  // 追加: 公開/非公開 (true=公開のみ, false=非公開のみ, undefined=指定なし)
  isPublic?: boolean
  // 追加: 作成日範囲 (今週/今月/今年から経過分を絞る)
  createdSince?: CreatedSince
  // 追加: スポット数下限 (例: 3 = 3 件以上のプレイスリストのみ)
  minSpots?: number
  // 追加: 自分が作成したもののみに絞る (currentUserId が必要)
  mineOnly?: boolean
  currentUserId?: string
  // 追加: マップ表示範囲に含まれるスポットを持つプレイスリストのみ
  bbox?: BBox
}

const DISTANCE_METERS: Record<string, number> = {
  "500m 以内": 500,
  "1km 以内":  1000,
  "3km 以内":  3000,
  "10km 以内": 10000,
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function minDistance(placeList: PlaceList, coords: { lat: number; lng: number }): number {
  if (placeList.spots.length === 0) return Number.POSITIVE_INFINITY
  return Math.min(...placeList.spots.map((s: Spot) => haversineMeters(coords, s)))
}

export function hasActiveFilters(f: PlaceListFilters): boolean {
  return Boolean(
    f.pref ||
    f.cats?.length ||
    f.query ||
    f.distance ||
    f.showAll ||
    f.isPublic !== undefined ||
    f.createdSince ||
    f.minSpots ||
    f.mineOnly ||
    f.bbox,
  )
}

function spotInBBox(spot: Spot, bbox: BBox): boolean {
  return (
    spot.lat <= bbox.north &&
    spot.lat >= bbox.south &&
    spot.lng <= bbox.east &&
    spot.lng >= bbox.west
  )
}

// 「今週/今月/今年」のラベルを「○日前」の cutoff Date に変換
function cutoffFromCreatedSince(since: CreatedSince): Date {
  const now = new Date()
  const cutoff = new Date(now)
  if (since === "week") cutoff.setDate(now.getDate() - 7)
  else if (since === "month") cutoff.setMonth(now.getMonth() - 1)
  else if (since === "year") cutoff.setFullYear(now.getFullYear() - 1)
  return cutoff
}

export function filterPlaceLists(placeLists: PlaceList[], filters: PlaceListFilters): PlaceList[] {
  let result = placeLists

  if (filters.pref) {
    const pref = filters.pref
    // 1) prefecture カラム完全一致が優先
    // 2) Nominatim が address.state を返さず prefecture が null のスポット向けに、
    //    description (= display_name の住所文字列) に都道府県名が含まれているかも見る
    result = result.filter((p) =>
      p.spots.some(
        (s) => s.prefecture === pref || (s.description?.includes(pref) ?? false),
      ),
    )
  }
  if (filters.cats?.length) {
    const cats = new Set(filters.cats)
    result = result.filter((p) =>
      (p.tags?.some((t) => cats.has(t)) ?? false) ||
      p.spots.some((s) => s.category != null && cats.has(s.category))
    )
  }
  if (filters.query) {
    const q = filters.query.toLowerCase()
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
    )
  }
  if (filters.distance && filters.coords) {
    const radius = DISTANCE_METERS[filters.distance]
    if (radius) {
      const coords = filters.coords
      result = result.filter((p) => p.spots.some((s) => haversineMeters(coords, s) <= radius))
    }
  }
  if (filters.isPublic !== undefined) {
    result = result.filter((p) => (p.isPublic ?? true) === filters.isPublic)
  }
  if (filters.createdSince) {
    const cutoff = cutoffFromCreatedSince(filters.createdSince).getTime()
    result = result.filter((p) => {
      if (!p.createdAt) return false
      return new Date(p.createdAt).getTime() >= cutoff
    })
  }
  if (filters.minSpots && filters.minSpots > 0) {
    const min = filters.minSpots
    result = result.filter((p) => p.spots.length >= min)
  }
  if (filters.mineOnly && filters.currentUserId) {
    const uid = filters.currentUserId
    result = result.filter((p) => p.creator === uid)
  }
  if (filters.bbox) {
    const bbox = filters.bbox
    result = result.filter((p) => p.spots.some((s) => spotInBBox(s, bbox)))
  }

  const order = filters.order ?? "登録が新しい順"
  if (order === "登録が古い順") {
    result = [...result].sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
  } else if (order === "距離が近い順" && filters.coords) {
    const coords = filters.coords
    result = [...result].sort((a, b) => minDistance(a, coords) - minDistance(b, coords))
  } else if (order === "人気順") {
    result = [...result].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
  } else {
    result = [...result].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
  }

  return result
}

export function parseFilters(searchParams: { [key: string]: string | string[] | undefined }): PlaceListFilters {
  const get = (k: string) => {
    const v = searchParams[k]
    return Array.isArray(v) ? v[0] : v
  }

  const lat = get("lat")
  const lng = get("lng")
  const order = get("order") as SortOrder | undefined

  const pub = get("pub")
  const since = get("since") as CreatedSince | undefined
  const min = get("min")
  const n = get("n"), s = get("s"), e = get("e"), w = get("w")
  const bbox = n && s && e && w &&
    [n, s, e, w].every((v) => !isNaN(Number(v)))
    ? { north: Number(n), south: Number(s), east: Number(e), west: Number(w) }
    : undefined

  return {
    pref: get("pref") || undefined,
    cats: get("cat")?.split(",").filter(Boolean),
    query: get("q") || undefined,
    distance: get("distance") || undefined,
    coords: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
    order: order ?? "登録が新しい順",
    showAll: get("show") === "all",
    isPublic: pub === "1" ? true : pub === "0" ? false : undefined,
    createdSince: since && ["week", "month", "year"].includes(since) ? since : undefined,
    minSpots: min && /^\d+$/.test(min) ? Number(min) : undefined,
    mineOnly: get("mine") === "1",
    bbox,
  }
}
