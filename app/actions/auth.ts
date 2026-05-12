'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/server/supabaseAuth';
import { supabase as adminClient } from '@/lib/server/supabase';

export type AuthFormState = {
  error?: string;
  message?: string;
} | undefined;

function getString(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getString(formData, 'email');
  const password = formData.get('password');

  if (!email || typeof password !== 'string' || !password) {
    return { error: 'メールアドレスとパスワードを入力してください。' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'メールアドレスまたはパスワードが正しくありません。' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getString(formData, 'email');
  const password = formData.get('password');

  if (!email || typeof password !== 'string' || password.length < 6) {
    return { error: 'メールアドレスと 6 文字以上のパスワードを入力してください。' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:2200'}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // メール確認が有効な場合は session が null になる
  if (!data.session) {
    return { message: '確認メールを送信しました。メール内のリンクから登録を完了してください。' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getString(formData, 'email');
  if (!email) {
    return { error: 'メールアドレスを入力してください。' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:2200';
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/auth/update-password`,
  });

  // ユーザー列挙を防ぐため、エラー有無に関わらず成功と同じメッセージを返す
  if (error) console.error('[forgotPasswordAction]', error);
  return { message: 'パスワード再設定用のリンクをメールで送信しました（登録済みアドレスの場合）。' };
}

export async function deleteAccountAction(): Promise<{ error?: string } | void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // service_role でユーザー削除
  // schema の on delete cascade で creator = user.id の spots / place_lists も自動削除される
  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('[deleteAccountAction]', error);
    return { error: 'アカウントの削除に失敗しました: ' + error.message };
  }

  // Cookie 側のセッションを破棄
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = formData.get('password');
  if (typeof password !== 'string' || password.length < 6) {
    return { error: '6 文字以上のパスワードを入力してください。' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'リンクの有効期限が切れている可能性があります。もう一度最初からやり直してください。' };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
