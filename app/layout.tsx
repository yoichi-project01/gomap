import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
// ▼ 変更: 新しいパスからインポート
import BottomNav from "@/components/ui/BottomNav";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gomap",
  description: "大阪観光名所スポットアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* 背景を黒(bg-black)に設定し、Spotify風のダークテーマを全体に適用 */}
      <body className={`${geist.variable} antialiased bg-black text-white`}>
        {children}
        {/* アプリ全体で共通のボトムナビゲーション */}
        <BottomNav />
      </body>
    </html>
  );
}