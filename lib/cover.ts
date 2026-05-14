// カバー画像 URL のヘルパー (サーバー/クライアント両方で使う)

// public URL から covers バケット内の object path ({user_id}/{uuid}.jpg) を抜き出す。
// URL 形式は Supabase Storage の仕様で安定:
//   https://<project>.supabase.co/storage/v1/object/public/covers/<user_id>/<uuid>.jpg
// 形式が異なれば null (古い手動アップロード等)。
export function coverUrlToPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/covers/";
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  const tail = url.slice(idx + marker.length);
  const q = tail.indexOf("?");
  return q >= 0 ? tail.slice(0, q) : tail;
}
