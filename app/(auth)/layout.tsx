import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/server/supabaseAuth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // すでにログイン済みならホームへ
  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
