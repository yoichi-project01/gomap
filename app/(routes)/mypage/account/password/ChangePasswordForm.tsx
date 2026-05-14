"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { changePasswordAction, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = undefined;
const MIN_NEW_LENGTH = 6;
const REDIRECT_DELAY_MS = 1500;

function PasswordInput({
  id, name, label, autoComplete, minLength, disabled,
}: {
  id: string; name: string; label: string; autoComplete: string; minLength?: number; disabled?: boolean
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          disabled={disabled}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 pr-10 text-sm outline-none focus:border-zinc-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "パスワードを隠す" : "パスワードを表示"}
          disabled={disabled}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition disabled:opacity-50"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  const succeeded = Boolean(state?.message);

  // 成功時はフォームを使えなくし、少し後でマイページへ戻す
  useEffect(() => {
    if (!succeeded) return;
    const t = window.setTimeout(() => {
      router.push("/mypage");
      router.refresh();
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [succeeded, router]);

  return (
    <form action={formAction} className="space-y-4">
      <PasswordInput
        id="currentPassword"
        name="currentPassword"
        label="現在のパスワード"
        autoComplete="current-password"
        disabled={succeeded}
      />

      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800" />

      <PasswordInput
        id="newPassword"
        name="newPassword"
        label={`新しいパスワード（${MIN_NEW_LENGTH} 文字以上）`}
        autoComplete="new-password"
        minLength={MIN_NEW_LENGTH}
        disabled={succeeded}
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="新しいパスワード（確認）"
        autoComplete="new-password"
        minLength={MIN_NEW_LENGTH}
        disabled={succeeded}
      />

      {state?.error && (
        <p className="text-xs text-red-500 dark:text-red-400" role="alert">{state.error}</p>
      )}
      {state?.message && (
        <div className="flex items-start gap-2 text-xs text-green-600 dark:text-green-400" role="status">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{state.message} まもなくマイページに戻ります…</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || succeeded}
        className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold py-2.5 hover:opacity-90 transition disabled:opacity-50"
      >
        {isPending ? "変更中…" : succeeded ? "変更しました" : "パスワードを変更"}
      </button>
    </form>
  );
}
