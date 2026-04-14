// (routes) グループの共通レイアウト
// ボトムナビは app/layout.tsx で表示するのでここでは不要

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
