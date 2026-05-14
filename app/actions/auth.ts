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
  // creator = user.id の spots / place_lists は on delete set null で残り、
  // それ以外の個人ログ (favorites / place_list_likes / place_list_saves / profiles) は cascade で削除される
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

// 設定画面からのパスワード変更。
// /auth/update-password (リカバリーメール経由) と違い、現在のパスワードによる再認証を要求する。
//   - 現在のパスワード必須 (Supabase は signInWithPassword で検証)
//   - 新パスワードは 8 文字以上
//   - 新パスワードと確認入力が一致
//   - 現在のパスワードと同一は禁止
//   - 変更成功時、他デバイスのセッションをサインアウト (scope: 'others') して乗っ取り耐性を高める
export async function changePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const currentPassword = formData.get('currentPassword');
  const newPassword     = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');

  if (typeof currentPassword !== 'string' || !currentPassword) {
    return { error: '現在のパスワードを入力してください。' };
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return { error: '新しいパスワードは 8 文字以上にしてください。' };
  }
  if (typeof confirmPassword !== 'string' || newPassword !== confirmPassword) {
    return { error: '新しいパスワード(確認)が一致しません。' };
  }
  if (currentPassword === newPassword) {
    return { error: '新しいパスワードは現在と異なるものにしてください。' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { error: 'ログインが必要です。' };
  }

  // 現在のパスワードで再認証 (失敗で攻撃シグナルになるので汎用メッセージにする)
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return { error: '現在のパスワードが正しくありません。' };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return { error: updateError.message };
  }

  // 別デバイス・別ブラウザのセッションを失効させる (現セッションは維持)
  try {
    await supabase.auth.signOut({ scope: 'others' });
  } catch (e) {
    console.error('[changePasswordAction] signOut others failed', e);
  }

  return { message: 'パスワードを変更しました。他のデバイスからは再ログインが必要です。' };
}
