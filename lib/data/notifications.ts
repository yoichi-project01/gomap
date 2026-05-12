// 通知管理用のデータとインターフェース

export interface Notification {
  id: string
  type: "like" | "update" // 'like': いいね, 'update': 更新
  targetId: number // 対象のプレイスリストID
  targetTitle: string // 対象のプレイスリストタイトル
  message: string // 通知メッセージ
  timestamp: Date // 通知時刻
  isRead: boolean // 既読フラグ
}

// サンプル通知データ
const now = new Date()
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)

export const notifications: Notification[] = [
  // 未読通知（上部に表示）
  {
    id: "notif-1",
    type: "like",
    targetId: 1,
    targetTitle: "大阪の観光地7選",
    message: "田中さんが「大阪の観光地7選」にいいねしました",
    timestamp: oneHourAgo,
    isRead: false,
  },
  {
    id: "notif-2",
    type: "update",
    targetId: 3,
    targetTitle: "大阪の夜景スポット3選",
    message: "「大阪の夜景スポット3選」が更新されました",
    timestamp: threeHoursAgo,
    isRead: false,
  },
  {
    id: "notif-3",
    type: "like",
    targetId: 2,
    targetTitle: "大阪のグルメ5選",
    message: "佐藤さんが「大阪のグルメ5選」にいいねしました",
    timestamp: oneDayAgo,
    isRead: false,
  },
  // 既読通知（下部に表示）
  {
    id: "notif-4",
    type: "update",
    targetId: 4,
    targetTitle: "大阪のショッピング5選",
    message: "「大阪のショッピング5選」が更新されました",
    timestamp: twoDaysAgo,
    isRead: true,
  },
  {
    id: "notif-5",
    type: "like",
    targetId: 5,
    targetTitle: "大阪の自然スポット4選",
    message: "鈴木さんが「大阪の自然スポット4選」にいいねしました",
    timestamp: twoDaysAgo,
    isRead: true,
  },
  {
    id: "notif-6",
    type: "update",
    targetId: 6,
    targetTitle: "大阪のカフェ6選",
    message: "「大阪のカフェ6選」が更新されました",
    timestamp: fiveDaysAgo,
    isRead: true,
  },
]

// 通知が届いてからの時間を表示用文字列に変換
export function getTimeAgoString(timestamp: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "今"
  if (diffMins < 60) return `${diffMins}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  
  return timestamp.toLocaleDateString("ja-JP")
}

// 未読通知の件数を取得
export function getUnreadCount(): number {
  return notifications.filter((n) => !n.isRead).length
}
