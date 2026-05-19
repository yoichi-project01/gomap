import { NextRequest, NextResponse } from "next/server";
import { createPlaceList, listPlaceLists } from "@/lib/server/placeLists";
import { supabase } from "@/lib/server/supabase";
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth";

export async function GET() {
  try {
    const placeLists = await listPlaceLists(supabase);
    return NextResponse.json(placeLists);
  } catch (error) {
    console.error("[GET /api/placelists]", error);
    return NextResponse.json({ error: "プレイスリスト一覧の取得に失敗しました" }, { status: 500 });
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
    !Array.isArray((body as { spotIds?: unknown }).spotIds) ||
    !(body as { spotIds: unknown[] }).spotIds.every((id) => typeof id === "string")
  ) {
    return NextResponse.json(
      { error: "name(string) / spotIds(string[]) は必須です" },
      { status: 400 },
    );
  }

  const rawIsPublic = (body as { isPublic?: unknown }).isPublic;
  if (rawIsPublic !== undefined && typeof rawIsPublic !== "boolean") {
    return NextResponse.json({ error: "isPublic は boolean で指定してください" }, { status: 400 });
  }

  const input = body as {
    name: string;
    spotIds: string[];
    description?: string;
    category?: string;
    coverImageUrl?: string;
    isPublic?: boolean;
  };

  try {
    const created = await createPlaceList(authed, { ...input, creator: user.id });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[POST /api/placelists]", detail);
    return NextResponse.json({ error: "プレイスリストの登録に失敗しました", detail }, { status: 500 });
  }
}
