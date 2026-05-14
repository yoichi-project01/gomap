"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const RECIPIENT = "corelift.system@gmail.com";

const CATEGORIES = [
  { value: "bug", label: "バグ報告" },
  { value: "feature", label: "機能要望" },
  { value: "ui", label: "UI/操作性" },
  { value: "data", label: "データの誤り" },
  { value: "other", label: "その他" },
] as const;

export default function FeedbackForm() {
  const [category, setCategory] = useState<string>(CATEGORIES[0].value);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const trimmedSubject = subject.trim();
  const trimmedBody = body.trim();
  const canSend = trimmedSubject.length > 0 && trimmedBody.length > 0;

  function handleSend() {
    if (!canSend) return;
    const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label ?? "";
    const mailSubject = `[Gomap/${categoryLabel}] ${trimmedSubject}`;
    const href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(trimmedBody)}`;
    window.location.href = href;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-5">
      <div>
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
          カテゴリ
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                category === c.value
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="feedback-subject" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
          件名
        </label>
        <input
          id="feedback-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="例: 検索結果が表示されない"
          maxLength={100}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
        />
      </div>

      <div>
        <label htmlFor="feedback-body" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
          内容
        </label>
        <textarea
          id="feedback-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="できるだけ具体的にお書きください。再現手順・端末・ブラウザ情報があると助かります。"
          rows={8}
          maxLength={2000}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 resize-y"
        />
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 text-right">
          {body.length} / 2000
        </p>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        <Send className="w-4 h-4" />
        メールアプリで送る
      </button>

      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
        送信先: {RECIPIENT}
      </p>
    </div>
  );
}
