"use client";

// ヘッダー・ナビゲーションバー
// 全ページ共通で表示される上部のメニュー

import Link from "next/link";
import { usePathname } from "next/navigation";

// ナビゲーションのリンク一覧
// 新しいページを追加したらここにも追加する
const NAV_LINKS = [
  { href: "/",        label: "地図" },
  { href: "/spots",   label: "スポット" },
  { href: "/mypage",  label: "マイページ" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white border-b border-zinc-200 px-4 h-14 flex items-center justify-between">
      {/* アプリ名 */}
      <Link href="/" className="text-lg font-bold text-zinc-900">
        Go! Map
      </Link>

      {/* ナビゲーションリンク */}
      <nav className="flex gap-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
              pathname === link.href
                ? "bg-zinc-900 text-white"           // 現在のページ
                : "text-zinc-600 hover:text-zinc-900" // それ以外
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
