'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/server/supabaseAuth';

export type UpdateDisplayNameResult = { error?: string } | undefined;

export async function updateDisplayNameAction(
  name: string,
): Promise<UpdateDisplayNameResult> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: '表示名を入力してください' };
  }
  if (trimmed.length > 50) {
    return { error: '表示名は 50 文字以内にしてください' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'ログインが必要です' };
  }

  // auth.users.raw_user_meta_data.name をソース・オブ・トゥルースとして更新
  // (Supabase ダッシュボードの "Display Name" 列は name キーを読む)。
  // public.profiles.display_name は on_auth_user_updated トリガで追従する。
  const { error } = await supabase.auth.updateUser({
    data: { name: trimmed },
  });

  if (error) {
    console.error('[updateDisplayNameAction]', error);
    return { error: '表示名の保存に失敗しました' };
  }

  // 共有プレイスリスト・コレクション・ヘッダなど、表示名を出すページ全部
  revalidatePath('/', 'layout');
}
