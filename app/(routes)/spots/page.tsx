// スポット一覧ページ
// URL: /spots
// 登録されたスポットの一覧を表示する

import Link from "next/link";
import type { Spot } from "@/types/spot";

// ダミーデータ（後でAPIから取得するように変更する）
// TODO: getSpots() に差し替える
const DUMMY_SPOTS: Spot[] = [
  {
    id: "1",
    name: "東京タワー",
    description: "東京の有名な観光スポット",
    lat: 35.6586,
    lng: 139.7454,
    createdAt: "2026-04-08",
    createdBy: "user-1",
  },
  {
    id: "2",
    name: "渋谷スクランブル交差点",
    description: "世界で最も有名な交差点のひとつ",
    lat: 35.6595,
    lng: 139.7004,
    createdAt: "2026-04-08",
    createdBy: "user-2",
  },
  {
    id: "3",
    name: "新宿御苑",
    description: "都心にある広大な公園",
    lat: 35.6851,
    lng: 139.7100,
    createdAt: "2026-04-08",
    createdBy: "user-1",
  },
];

export default function SpotsPage() {
  return (
    <div>
      {/* ページタイトル */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">スポット一覧</h1>
        {/* TODO: スポット登録ボタン */}
        <button className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors">
          + 登録する
        </button>
      </div>

      {/* スポットのリスト */}
      <ul className="flex flex-col gap-3">
        {DUMMY_SPOTS.map((spot) => (
          <li key={spot.id}>
            {/* 詳細ページへのリンク */}
            <Link
              href={`/spots/${spot.id}`}
              className="block bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-400 transition-colors"
            >
              <p className="font-semibold text-zinc-900">{spot.name}</p>
              {spot.description && (
                <p className="text-sm text-zinc-500 mt-1">{spot.description}</p>
              )}
              <p className="text-xs text-zinc-400 mt-2">登録日: {spot.createdAt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
