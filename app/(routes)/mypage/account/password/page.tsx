import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata = {
  title: "パスワードの変更 | Gomap",
};

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mypage/account/password");

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-40 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/mypage"
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3"
          aria-label="マイページに戻る"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-700 dark:text-white" />
        </Link>
        <ShieldCheck className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">パスワードの変更</h1>
      </header>

      <main className="px-4 pt-6 max-w-md mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
            セキュリティのため、現在のパスワードを入力してから新しいパスワードを設定してください。
            変更すると他のデバイス・ブラウザのログインは無効になります。
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">
            アカウント: <span className="text-zinc-700 dark:text-zinc-200">{user.email}</span>
          </p>
          <ChangePasswordForm />
        </div>
      </main>
    </div>
  );
}
