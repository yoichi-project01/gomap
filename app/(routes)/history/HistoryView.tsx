"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Trash2, X } from "lucide-react";
import { useLocalStorageState } from "@/lib/hooks/useLocalStorageState";
import {
  type HistoryEntry,
  removeFromHistory,
  clearViewHistory,
  VIEW_HISTORY_KEY,
} from "@/lib/client/viewHistory";

const EMPTY: HistoryEntry[] = [];

function formatRelative(viewedAt: number): string {
  const diffMs = Date.now() - viewedAt;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}時間前`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}日前`;
  const d = new Date(viewedAt);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export default function HistoryView() {
  const [entries] = useLocalStorageState<HistoryEntry[]>(VIEW_HISTORY_KEY, EMPTY);
  const [confirmingClear, setConfirmingClear] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-6 py-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <Clock className="w-7 h-7 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          閲覧履歴はありません
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs leading-relaxed">
          プレイスリストを開くと、ここに最近見たものが表示されます。
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{entries.length} 件</span>
        {confirmingClear ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearViewHistory();
                setConfirmingClear(false);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white"
            >
              すべて削除
            </button>
            <button
              onClick={() => setConfirmingClear(false)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingClear(true)}
            className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            履歴をクリア
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden"
          >
            <div className="flex items-stretch">
              <Link
                href={`/placelists/${entry.id}`}
                className="flex flex-1 min-w-0 items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <div
                  className="w-16 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800 bg-cover bg-center shrink-0"
                  style={
                    entry.coverImageUrl
                      ? { backgroundImage: `url(${entry.coverImageUrl})` }
                      : undefined
                  }
                >
                  {!entry.coverImageUrl && (
                    <div className="h-full w-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                      <Clock className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {entry.name}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    スポット {entry.spotsCount}件 · {formatRelative(entry.viewedAt)}
                  </p>
                  {entry.description && (
                    <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5 truncate">
                      {entry.description}
                    </p>
                  )}
                </div>
              </Link>
              <button
                onClick={() => removeFromHistory(entry.id)}
                aria-label={`${entry.name}を履歴から削除`}
                className="px-3 text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
