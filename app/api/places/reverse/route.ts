import { NextRequest, NextResponse } from 'next/server';

type NominatimAddress = {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  state?: string;
  country?: string;
  postcode?: string;
};

type NominatimReverseResult = {
  display_name?: string;
  address?: NominatimAddress;
};

function buildJapaneseAddress(addr: NominatimAddress): string {
  const parts: string[] = [];

  const candidates = [
    addr.house_number,
    addr.road,
    addr.neighbourhood,
    addr.suburb ?? addr.quarter,
    addr.city_district,
    addr.city ?? addr.town ?? addr.village ?? addr.hamlet,
    addr.state,
  ].filter((p): p is string => Boolean(p));

  // big → small (reverse for Japanese convention)
  const reversed = [...candidates].reverse();

  for (const part of reversed) {
    const joined = parts.join('');
    // skip if already subsumed by what we have
    if (joined.includes(part)) continue;
    // if what we have is subsumed by this part, replace last entry
    const lastIdx = parts.length - 1;
    if (lastIdx >= 0 && part.includes(parts[lastIdx])) {
      parts[lastIdx] = part;
    } else {
      parts.push(part);
    }
  }

  return parts.join('');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ja`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'gomap-app/1.0' },
    });
    if (!res.ok) {
      return NextResponse.json({ address: `${lat}, ${lng}`, prefecture: null });
    }
    const json = (await res.json()) as NominatimReverseResult;
    const addr = json.address ?? {};
    const address = buildJapaneseAddress(addr) || json.display_name || `${lat}, ${lng}`;
    const prefecture = addr.state ?? null;
    return NextResponse.json({ address, prefecture });
  } catch {
    return NextResponse.json({ address: `${lat}, ${lng}`, prefecture: null });
  }
}
