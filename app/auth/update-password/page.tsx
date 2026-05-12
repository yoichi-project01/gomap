import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/server/supabaseAuth';
import UpdatePasswordForm from './UpdatePasswordForm';

export const metadata = {
  title: '新しいパスワードの設定 | Gomap',
};

// /auth/update-password
// メールリンクから /api/auth/callback で session が確立した後にここに来る
export default async function UpdatePasswordPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/forgot-password');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">新しいパスワードを設定</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{user.email}</p>
        </div>

        <UpdatePasswordForm />
      </div>
    </div>
  );
}
