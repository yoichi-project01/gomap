// バックエンド担当
// GET  /api/spots  → スポット一覧取得
// POST /api/spots  → スポット新規登録

import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/lib/server/supabase";
// import type { CreateSpotInput } from "@/types/spot";

export async function GET() {
  // TODO: Supabaseからスポット一覧を取得する
  // const { data, error } = await supabase.from("spots").select("*");
  // if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // return NextResponse.json(data);

  return NextResponse.json([]); // 仮のレスポンス
}

export async function POST(req: NextRequest) {
  // TODO: リクエストボディを受け取ってSupabaseに登録する
  // const body: CreateSpotInput = await req.json();
  // const { data, error } = await supabase.from("spots").insert(body).select().single();
  // if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // return NextResponse.json(data, { status: 201 });

  return NextResponse.json({}, { status: 201 }); // 仮のレスポンス
}
