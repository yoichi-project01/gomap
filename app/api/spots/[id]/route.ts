import { NextRequest, NextResponse } from "next/server";
import { deleteSpot, getSpotById } from "@/lib/server/spots";
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
