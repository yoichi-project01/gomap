import { NextRequest, NextResponse } from "next/server";
import { listSpots, createSpot } from "@/lib/server/spots";
import { supabase } from "@/lib/server/supabase";
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  try {
    const spots = await listSpots(supabase, {
      prefecture: sp.get("prefecture") ?? undefined,
      category: sp.get("category") ?? undefined,
      q: sp.get("q") ?? undefined,
    });
    return NextResponse.json(spots);
  } catch (error) {
    console.error("[GET /api/spots]", error);
    return NextResponse.json({ error: "スポット一覧の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authed = await createSupabaseServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエスト本文が JSON として解析できません" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { name?: unknown }).name !== "string" ||
    typeof (body as { lat?: unknown }).lat !== "number" ||
    typeof (body as { lng?: unknown }).lng !== "number"
  ) {
    return NextResponse.json(
      { error: "name(string) / lat(number) / lng(number) は必須です" },
      { status: 400 },
    );
  }

  const input = body as {
    name: string;
    lat: number;
    lng: number;
    description?: string;
    prefecture?: string;
    category?: string;
    coverImageUrl?: string;
    source?: unknown;
  };

  if (input.source !== undefined && input.source !== "user" && input.source !== "map_ref") {
    return NextResponse.json(
      { error: "source は 'user' または 'map_ref' を指定してください" },
      { status: 400 },
    );
  }
  const source: "user" | "map_ref" = input.source === "map_ref" ? "map_ref" : "user";

  try {
    const created = await createSpot(authed, {
      name: input.name,
      description: input.description,
      lat: input.lat,
      lng: input.lng,
      prefecture: input.prefecture,
      category: input.category,
      coverImageUrl: input.coverImageUrl,
      creator: user.id,
      source,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/spots]", error);
    return NextResponse.json({ error: "スポットの登録に失敗しました" }, { status: 500 });
  }
}
