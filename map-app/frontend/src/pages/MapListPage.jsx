import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MapCard from "../components/MapCard";
import { getMaps } from "../services/api";

// カテゴリ表示名の対応表（HomePage と合わせる）
const CATEGORY_LABELS = {
  cafe:        "☕ カフェ",
  food:        "🍜 グルメ",
  sightseeing: "🏯 観光",
  nature:      "🌿 自然・公園",
  shopping:    "🛍️ ショッピング",
  sports:      "⚽ スポーツ",
  night:       "🌃 夜景・バー",
  other:       "📌 その他",
};

// マップ一覧ページ
// URL例: /maps?category=cafe
// カテゴリが指定されていれば絞り込み表示、なければ全件表示
function MapListPage() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // URLクエリパラメータからカテゴリを取得する
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  useEffect(() => {
    getMaps()
      .then((data) => setMaps(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // カテゴリ・テキスト検索でフィルタリング
  // TODO: 件数が増えたらバックエンドでの検索に切り替える
  const filtered = maps.filter((m) => {
    const matchesCategory = selectedCategory
      ? m.category === selectedCategory
      : true;
    const matchesQuery = m.title.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // カテゴリの絞り込みを解除する
  const clearCategory = () => {
    setSearchParams({});
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            {selectedCategory
              ? CATEGORY_LABELS[selectedCategory] ?? selectedCategory
              : "マップ一覧"}
          </h1>
          {/* 絞り込み中であれば解除ボタンを表示 */}
          {selectedCategory && (
            <button
              className="category-clear-btn"
              onClick={clearCategory}
            >
              ✕ 絞り込みを解除
            </button>
          )}
        </div>
        <Link to="/maps/create" className="btn btn--primary">
          + マップを作る
        </Link>
      </div>

      {/* テキスト検索バー */}
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="マップ名で検索..."
        />
      </div>

      {/* カードグリッド */}
      {loading ? (
        <p>読み込み中...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>マップが見つかりませんでした</p>
          <Link to="/" className="btn btn--outline">
            カテゴリから探す
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MapListPage;
