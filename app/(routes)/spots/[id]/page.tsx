// スポット詳細ページ
// URL: /spots/[id]  例: /spots/1
// 特定スポットの詳細情報を表示する

import Link from "next/link";
import type { Spot } from "@/types/spot";

// ダミーデータ（後でAPIから取得するように変更する）
// TODO: getSpotById(id) に差し替える
const DUMMY_SPOTS: Spot[] = [
  {
    id: "1",
    name: "東京タワー",
    description: "東京の有名な観光スポット。高さ333mの電波塔で、展望台からは東京の街を一望できる。",
    lat: 35.6586,
    lng: 139.7454,
    createdAt: "2026-04-08",
    createdBy: "user-1",
  },
  {
    id: "2",
    name: "渋谷スクランブル交差点",
    description: "世界で最も有名な交差点のひとつ。一度に数千人が行き交う光景は圧巻。",
    lat: 35.6595,
    lng: 139.7004,
    createdAt: "2026-04-08",
    createdBy: "user-2",
  },
  {
    id: "3",
    name: "新宿御苑",
    description: "都心にある広大な公園。春は桜、秋は紅葉が楽しめる。",
    lat: 35.6851,
    lng: 139.7100,
    createdAt: "2026-04-08",
    createdBy: "user-1",
  },
];

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // URLの [id] を取得する
  const { id } = await params;

  // IDに一致するスポットを探す
  const spot = DUMMY_SPOTS.find((s) => s.id === id);

  // 見つからなかった場合
  if (!spot) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">スポットが見つかりませんでした</p>
        <Link href="/spots" className="text-sm text-zinc-900 underline mt-4 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* 戻るリンク */}
      <Link href="/spots" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
        ← 一覧に戻る
      </Link>

      {/* スポット情報 */}
      <div className="mt-4 bg-white border border-zinc-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-zinc-900">{spot.name}</h1>

        {spot.description && (
          <p className="text-zinc-600 mt-3">{spot.description}</p>
        )}

        {/* 座標情報 */}
        <div className="mt-6 pt-4 border-t border-zinc-100">
          <p className="text-xs text-zinc-400">緯度: {spot.lat}</p>
          <p className="text-xs text-zinc-400">経度: {spot.lng}</p>
          <p className="text-xs text-zinc-400 mt-1">登録日: {spot.createdAt}</p>
        </div>

        {/* TODO: 地図上でこのスポットを表示するボタン */}
        <Link
          href="/"
          className="mt-6 block text-center bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors"
        >
          地図で見る
        </Link>
      </div>
    </div>
  );
}
