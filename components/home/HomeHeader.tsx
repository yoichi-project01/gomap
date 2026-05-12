'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Clock, Settings, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { notifications, getTimeAgoString } from '@/lib/data/notifications';

export default function HomeHeader() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationList, setNotificationList] = useState(notifications);

  const unreadCount = notificationList.filter(n => !n.isRead).length;

  // 通知をクリックして既読にする
  const markAsRead = (id: string) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  // 通知を削除する
  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setNotificationList((prev) => prev.filter((n) => n.id !== id))
  }

  // 未読通知を上、既読通知を下で分ける
  const unreadNotifications = notificationList
    .filter((n) => !n.isRead)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const readNotifications = notificationList
    .filter((n) => n.isRead)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const allNotifications = [...unreadNotifications, ...readNotifications]

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between w-full">
          <Link
            href="/mypage"
            className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold text-black cursor-pointer hover:opacity-80 transition"
          >
            Y
          </Link>

          <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
            <ThemeToggle className="w-8 h-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100" />
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative hover:text-zinc-900 dark:hover:text-white transition"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <Clock className="w-6 h-6 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition" />
            <Link href="/mypage">
              <Settings className="w-6 h-6 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition" />
            </Link>
          </div>
        </div>
      </header>

      {/* 通知ポップアップ */}
      {isNotificationOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsNotificationOpen(false)}
          />

          {/* ポップアップ */}
          <div className="fixed top-0 right-0 h-full w-[28rem] max-w-[95vw] bg-white dark:bg-zinc-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">通知</h2>
              <button
                onClick={() => setIsNotificationOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            {/* 通知リスト */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {allNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-500 dark:text-zinc-400">通知はありません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allNotifications.map((notification, index) => {
                    const isLastUnread =
                      index === unreadNotifications.length - 1 &&
                      unreadNotifications.length > 0 &&
                      readNotifications.length > 0

                    return (
                      <div key={notification.id}>
                        <div
                          className={`relative w-full text-left px-3 py-3 rounded-lg border transition-colors cursor-pointer ${
                            notification.isRead
                              ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60"
                              : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900"
                          }`}
                        >
                          <Link
                            href={`/spots/${notification.targetId}`}
                            onClick={() => {
                              markAsRead(notification.id)
                              setIsNotificationOpen(false)
                            }}
                            className="block"
                          >
                            <h3
                              className={`font-semibold line-clamp-1 text-sm ${
                                notification.isRead
                                  ? "text-zinc-600 dark:text-zinc-400"
                                  : "text-zinc-900 dark:text-white"
                              }`}
                            >
                              {notification.message}
                            </h3>
                            <p
                              className={`text-xs mt-1 line-clamp-1 ${
                                notification.isRead
                                  ? "text-zinc-500 dark:text-zinc-500"
                                  : "text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              「{notification.targetTitle}」
                            </p>
                          </Link>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                              )}
                              <span
                                className={`text-xs whitespace-nowrap ${
                                  notification.isRead
                                    ? "text-zinc-500 dark:text-zinc-500"
                                    : "text-zinc-600 dark:text-zinc-400"
                                }`}
                              >
                                {getTimeAgoString(notification.timestamp)}
                              </span>
                            </div>
                            <button
                              onClick={(e) => deleteNotification(notification.id, e)}
                              className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition"
                              title="削除"
                            >
                              削除
                            </button>
                          </div>
                        </div>

                        {/* 未読・既読の区切り線 */}
                        {isLastUnread && (
                          <div className="my-3 flex items-center gap-3">
                            <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />
                            <span className="text-xs text-zinc-500 dark:text-zinc-500">
                              既読
                            </span>
                            <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* すべて削除ボタン */}
            {allNotifications.length > 0 && (
              <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-3">
                <button
                  onClick={() => setNotificationList([])}
                  className="w-full text-center text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
                >
                  すべて削除
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
