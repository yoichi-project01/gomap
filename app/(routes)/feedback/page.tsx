import Link from "next/link";
import { ChevronLeft, MessageSquare } from "lucide-react";
import FeedbackForm from "./FeedbackForm";

export const metadata = {
  title: "フィードバック | Gomap",
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/mypage"
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3"
          aria-label="マイページに戻る"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-700 dark:text-white" />
        </Link>
        <MessageSquare className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">フィードバック</h1>
      </header>

      <main className="px-4 mt-6 max-w-2xl mx-auto">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 px-1">
          ご意見・ご要望・バグ報告などをお送りください。
        </p>

        <FeedbackForm />
      </main>
    </div>
  );
}
