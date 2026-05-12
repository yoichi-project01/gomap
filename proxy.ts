// Next.js 16: 旧 middleware は proxy.ts にリネームされた
// 1. Supabase セッションを毎リクエストでリフレッシュ
// 2. 認証必須ルートの未ログインアクセスを /login にリダイレクト

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ログイン必須なパス (前方一致)
const PROTECTED_PREFIXES = [
  '/mypage',
  '/mylibrary',
  '/spots/create',
  '/placelists/create',
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 期限切れトークンをここで更新しておく
  const { data: { user } } = await supabase.auth.getUser();

  // 認証必須ルートのガード
  const pathname = request.nextUrl.pathname;
  const requiresAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  );
  if (requiresAuth && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // 静的アセットと画像最適化を除外
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
