import Link from 'next/link';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata = {
  title: 'パスワードをお忘れですか | Gomap',
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">パスワード再設定</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          登録メールアドレスに再設定リンクを送ります
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-6">
        <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
          ログイン画面に戻る
        </Link>
      </p>
    </div>
  );
}
