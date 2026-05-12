import Link from 'next/link';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'ログイン | Gomap',
};

export default function LoginPage() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">ログイン</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Gomap アカウントでサインイン
        </p>
      </div>

      <LoginForm />

      <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-6">
        アカウントをお持ちでないですか？{' '}
        <Link href="/signup" className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  );
}
