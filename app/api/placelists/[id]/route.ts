import { NextRequest, NextResponse } from "next/server";
import { deletePlaceList, getPlaceListById, updatePlaceList } from "@/lib/server/placeLists";
import { supabase } from "@/lib/server/supabase";
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    const placeList = await getPlaceListById(supabase, id);
    if (!placeList) {
      return NextResponse.json({ error: "プレイスリストが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(placeList);
  } catch (error) {
    console.error("[GET /api/placelists/:id]", error);
    return NextResponse.json({ error: "プレイスリストの取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const { id } = await params;

  const authed = await createSupabaseServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  let body: { name?: string; description?: string; category?: string; coverImageUrl?: string; spotIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
  }

  const { name, spotIds } = body;
  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "nameは必須です" }, { status: 400 });
  }
  if (!Array.isArray(spotIds) || spotIds.length === 0) {
    return NextResponse.json({ error: "spotIdsは1件以上必要です" }, { status: 400 });
  }

  try {
    const updated = await updatePlaceList(authed, id, {
      name: name.trim(),
      description: body.description,
      category: body.category,
      coverImageUrl: body.coverImageUrl,
      spotIds,
    });
    if (!updated) {
      return NextResponse.json({ error: "プレイスリストが見つからないか、更新権限がありません" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/placelists/:id]", error);
    return NextResponse.json({ error: "プレイスリストの更新に失敗しました" }, { status: 500 });
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
    const deleted = await deletePlaceList(authed, id);
    if (!deleted) {
      return NextResponse.json({ error: "プレイスリストが見つからないか、削除権限がありません" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/placelists/:id]", error);
    return NextResponse.json({ error: "プレイスリストの削除に失敗しました" }, { status: 500 });
  }
}
