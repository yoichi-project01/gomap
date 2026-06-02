import { NextRequest, NextResponse } from "next/server";
import { deleteSpot, getSpotById, updateSpot } from "@/lib/server/spots";
import { supabase } from "@/lib/server/supabase";
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    const spot = await getSpotById(supabase, id);
    if (!spot) return NextResponse.json({ error: "スポットが見つかりません" }, { status: 404 });
    return NextResponse.json(spot);
  } catch (error) {
    console.error("[GET /api/spots/:id]", error);
    return NextResponse.json({ error: "スポットの取得に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const { id } = await params;

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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "リクエスト本文が不正です" }, { status: 400 });
  }

  const input = body as {
    name?: unknown;
    description?: unknown;
    lat?: unknown;
    lng?: unknown;
    prefecture?: unknown;
    category?: unknown;
    coverImageUrl?: unknown;
  };

  if (input.name !== undefined && typeof input.name !== "string") {
    return NextResponse.json({ error: "name は文字列で指定してください" }, { status: 400 });
  }
  if (input.lat !== undefined && typeof input.lat !== "number") {
    return NextResponse.json({ error: "lat は数値で指定してください" }, { status: 400 });
  }
  if (input.lng !== undefined && typeof input.lng !== "number") {
    return NextResponse.json({ error: "lng は数値で指定してください" }, { status: 400 });
  }

  try {
    const updated = await updateSpot(authed, id, {
      name:         input.name         as string | undefined,
      description:  input.description  as string | null | undefined,
      lat:          input.lat          as number | undefined,
      lng:          input.lng          as number | undefined,
      prefecture:   input.prefecture   as string | null | undefined,
      category:     input.category     as string | null | undefined,
      coverImageUrl: input.coverImageUrl as string | null | undefined,
    });
    if (!updated) {
      return NextResponse.json({ error: "スポットが見つからないか、更新権限がありません" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/spots/:id]", error);
    return NextResponse.json({ error: "スポットの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  const authed = await createSupabaseServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    // RLS が所有者チェックを行う。存在しないか所有者でない場合は false が返る。
    const deleted = await deleteSpot(authed, id);
    if (!deleted) {
      return NextResponse.json({ error: "スポットが見つからないか、削除権限がありません" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/spots/:id]", error);
    return NextResponse.json({ error: "スポットの削除に失敗しました" }, { status: 500 });
  }
}
