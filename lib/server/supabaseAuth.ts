// サーバー用 Supabase クライアント (Auth セッションを Cookie で扱う)
// Server Component / Server Action / Route Handler から呼び出すこと
// service_role を使う既存の supabase.ts とは別物

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component から呼ばれた場合は cookieStore.set が投げる
            // proxy.ts 側でセッション更新するので無視して問題なし
          }
        },
      },
    },
  );
}
