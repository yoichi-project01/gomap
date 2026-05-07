import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  // TODO: Supabaseから個別のスポット一覧を取得する
  return NextResponse.json([]); // 仮のレスポンス
}

export async function POST(req: NextRequest) {
  // TODO: リクエストボディを受け取ってSupabaseに個別スポットを登録する
  return NextResponse.json({}, { status: 201 }); // 仮のレスポンス
}