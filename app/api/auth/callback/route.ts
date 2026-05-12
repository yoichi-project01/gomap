// メール確認リンクからのリダイレクト先
// /api/auth/callback?code=xxx を受けて session を確立する

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/server/supabaseAuth';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=callback', url.origin));
}
