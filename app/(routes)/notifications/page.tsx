import Link from "next/link";
import { ChevronLeft, Bell, BellOff } from "lucide-react";

export const metadata = {
  title: "通知 | Gomap",
};

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3"
          aria-label="ホームに戻る"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-700 dark:text-white" />
        </Link>
        <Bell className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">通知</h1>
      </header>

      <main className="px-4 mt-6 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-6 py-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <BellOff className="w-7 h-7 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            通知はありません
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs leading-relaxed">
            プレイスリストへのいいねや保存、新着情報などのお知らせがあるとここに表示されます。
          </p>

          <Link
            href="/mypage"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
          >
            通知設定を開く
          </Link>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-6 px-1 text-center">
          通知機能は開発中です。今後のアップデートで対応予定です。
        </p>
      </main>
    </div>
  );
}
