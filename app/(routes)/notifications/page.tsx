import Link from "next/link"
import { ChevronLeft, Bell, BellOff, Heart } from "lucide-react"
import { listNotifications } from "@/lib/server/notifications"
import { MarkAllReadOnMount } from "./MarkAllReadOnMount"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "通知 | Gomap",
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "たった今"
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}日前`
  return `${Math.floor(days / 30)}ヶ月前`
}

export default async function NotificationsPage() {
  const notifications = await listNotifications()
  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <MarkAllReadOnMount hasUnread={hasUnread} />

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
        {notifications.length > 0 && (
          <span className="ml-2 text-sm text-zinc-400 dark:text-zinc-500">
            {notifications.length}件
          </span>
        )}
      </header>

      <main className="px-4 mt-4 max-w-2xl mx-auto">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-6 py-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <BellOff className="w-7 h-7 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              通知はありません
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs leading-relaxed">
              プレイスリストへのいいねがあるとここに表示されます。
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {notifications.map((n) => {
              const inner = (
                <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl transition-colors ${
                  n.isRead
                    ? "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
                    : "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
                }`}>
                  <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-snug">
                      <span className="font-semibold">
                        {n.actorName ?? "誰か"}
                      </span>
                      {"さんが"}
                      {n.placeListName ? (
                        <>「<span className="font-medium">{n.placeListName}</span>」</>
                      ) : "プレイスリスト"}
                      {"をいいねしました"}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                      {relativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2" />
                  )}
                </div>
              )

              return (
                <li key={n.id}>
                  {n.placeListId ? (
                    <Link href={`/placelists/${n.placeListId}`} className="block hover:opacity-90 transition-opacity">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
