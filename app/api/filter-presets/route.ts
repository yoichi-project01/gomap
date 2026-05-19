import { NextRequest, NextResponse } from "next/server";
import {
  createFilterPreset,
  listFilterPresets,
} from "@/lib/server/filterPresets";
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth";

export async function GET() {
  const authed = await createSupabaseServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  try {
    const presets = await listFilterPresets(authed, user.id);
    return NextResponse.json(presets);
  } catch (error) {
    console.error("[GET /api/filter-presets]", error);
    return NextResponse.json({ error: "プリセットの取得に失敗しました" }, { status: 500 });
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
    return NextResponse.json({ error: "JSON 解析に失敗" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { name?: unknown }).name !== "string" ||
    !(body as { name: string }).name.trim() ||
    typeof (body as { params?: unknown }).params !== "object"
  ) {
    return NextResponse.json(
      { error: "name(string) / params(object) は必須です" },
      { status: 400 },
    );
  }

  const input = body as { name: string; params: Record<string, unknown> };

  try {
    const created = await createFilterPreset(authed, user.id, {
      name: input.name.trim().slice(0, 50), // 名前は最大 50 文字
      params: input.params,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/filter-presets]", error);
    return NextResponse.json({ error: "プリセットの保存に失敗しました" }, { status: 500 });
  }
}
