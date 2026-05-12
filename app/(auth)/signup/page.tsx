import Link from 'next/link';
import SignupForm from './SignupForm';

export const metadata = {
  title: '新規登録 | Gomap',
};

export default function SignupPage() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">新規登録</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          メールアドレスでアカウントを作成
        </p>
      </div>

      <SignupForm />

      <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-6">
        すでにアカウントをお持ちですか？{' '}
        <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
