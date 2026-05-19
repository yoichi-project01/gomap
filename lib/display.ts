// 表示名・アバター生成まわりの純関数ユーティリティ。
// クライアント/サーバー両方から import できる。

// 文字列の先頭 1 グラフェム（surrogate pair・絵文字を考慮）。trim 後に評価する。
// 空文字なら "" を返す。
export function firstGrapheme(s: string | null | undefined): string {
  if (!s) return ""
  return Array.from(s.trim())[0] ?? ""
}

// アバター用の頭文字。基本は先頭 1 グラフェムを ASCII 英字なら大文字化、
// それ以外（日本語など）はそのまま返す。
export function avatarInitial(name: string | null | undefined, fallback = "?"): string {
  const ch = firstGrapheme(name)
  if (!ch) return fallback
  // ASCII 英字なら uppercase。日本語等の uppercase は意味がないのでスキップ。
  return /^[a-z]$/i.test(ch) ? ch.toUpperCase() : ch
}
