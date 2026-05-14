// 表示用の日時フォーマット。タイムゾーンは常に Asia/Tokyo。
// UTC 文字列を素朴に slice すると JST 境界で 1 日ズレるため、
// 日付を出す全画面でこのヘルパに集約する。

const JST_DATE = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const JST_DATETIME = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

// ISO 8601 文字列 (Supabase timestamptz) → "2026/05/14"
export function formatJstDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return JST_DATE.format(d)
}

// ISO 8601 文字列 → "2026/05/14 09:30"
export function formatJstDateTime(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return JST_DATETIME.format(d)
}
