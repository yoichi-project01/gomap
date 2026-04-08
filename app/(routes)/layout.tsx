// (routes) グループ内のページ共通レイアウト
// ヘッダーを表示する
// ※トップページ（地図）はフルスクリーンのためこのレイアウトを使わない

import Header from "@/components/Header";

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
