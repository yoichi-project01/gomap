import { NextRequest, NextResponse } from "next/server";
import { deleteFilterPreset } from "@/lib/server/filterPresets";
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  const authed = await createSupabaseServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    const ok = await deleteFilterPreset(authed, id);
    if (!ok) {
      return NextResponse.json({ error: "プリセットが見つからないか、削除権限がありません" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/filter-presets/:id]", error);
    return NextResponse.json({ error: "プリセットの削除に失敗しました" }, { status: 500 });
  }
}
