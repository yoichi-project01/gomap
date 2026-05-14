import type { PlaceList, Spot } from "@/types/spot"

export type SortOrder = "登録が新しい順" | "登録が古い順" | "距離が近い順"

export type PlaceListFilters = {
  pref?: string
  cats?: string[]
  query?: string
  distance?: string
  coords?: { lat: number; lng: number } | null
  order?: SortOrder
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
  return Boolean(f.pref || f.cats?.length || f.query || f.distance)
}

export function filterPlaceLists(placeLists: PlaceList[], filters: PlaceListFilters): PlaceList[] {
  let result = placeLists

  if (filters.pref) {
    result = result.filter((p) => p.spots.some((s) => s.prefecture === filters.pref))
  }
  if (filters.cats?.length) {
    const cats = new Set(filters.cats)
    result = result.filter((p) =>
      (p.category != null && cats.has(p.category)) ||
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

  const order = filters.order ?? "登録が新しい順"
  if (order === "登録が古い順") {
    result = [...result].sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
  } else if (order === "距離が近い順" && filters.coords) {
    const coords = filters.coords
    result = [...result].sort((a, b) => minDistance(a, coords) - minDistance(b, coords))
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

  return {
    pref: get("pref") || undefined,
    cats: get("cat")?.split(",").filter(Boolean),
    query: get("q") || undefined,
    distance: get("distance") || undefined,
    coords: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
    order: order ?? "登録が新しい順",
  }
}
