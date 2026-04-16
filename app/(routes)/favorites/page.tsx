// マイライブラリページ
// URL: /favorites
// TODO: ログインユーザーがライブラリ登録したスポットを表示する

import type { Spot } from "@/types/spot";

// ダミーデータ（Supabase連携後はお気に入りテーブルから取得する）
const DUMMY_FAVORITES: Spot[] = [
  {
    id: "1",
    name: "大阪城",
    description: "豊臣秀吉が築いた歴史的な城",
    lat: 34.6873,
    lng: 135.5262,
    createdAt: "2026-04-09",
    createdBy: "user-1",
  },
  {
    id: "3",
    name: "通天閣",
    description: "新世界のシンボルタワー",
    lat: 34.6526,
    lng: 135.5061,
    createdAt: "2026-04-09",
    createdBy: "user-1",
  },
];

export default function FavoritesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">マイライブラリ</h1>

      {DUMMY_FAVORITES.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <p className="text-4xl mb-4">❤️</p>
          <p className="text-sm">マイライブラリはまだありません</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {DUMMY_FAVORITES.map((spot) => (
            <li key={spot.id} className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start justify-between">
              <div>
                <p className="font-semibold text-zinc-900">{spot.name}</p>
                {spot.description && (
                  <p className="text-sm text-zinc-500 mt-1">{spot.description}</p>
                )}
                <p className="text-xs text-zinc-400 mt-2">登録日: {spot.createdAt}</p>
              </div>
              {/* TODO: お気に入り解除ボタン */}
              <button className="text-red-400 hover:text-red-600 transition-colors text-xl ml-4 shrink-0">
                ❤️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
