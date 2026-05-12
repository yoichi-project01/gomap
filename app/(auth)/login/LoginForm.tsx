'use client';

import { useActionState } from 'react';
import { loginAction, type AuthFormState } from '@/app/actions/auth';

const initialState: AuthFormState = undefined;

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      {state?.error && (
        <p className="text-xs text-red-500" role="alert">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold py-2.5 hover:opacity-90 transition disabled:opacity-50"
      >
        {isPending ? 'ログイン中…' : 'ログイン'}
      </button>
    </form>
  );
}
