import { useNavigate } from "react-router-dom";

// カテゴリ定義
// TODO: バックエンドから取得する形に切り替え可能
const CATEGORIES = [
  { id: "cafe",     label: "カフェ",       emoji: "☕" },
  { id: "food",     label: "グルメ",       emoji: "🍜" },
  { id: "sightseeing", label: "観光",      emoji: "🏯" },
  { id: "nature",   label: "自然・公園",   emoji: "🌿" },
  { id: "shopping", label: "ショッピング", emoji: "🛍️" },
  { id: "sports",   label: "スポーツ",     emoji: "⚽" },
  { id: "night",    label: "夜景・バー",   emoji: "🌃" },
  { id: "other",    label: "その他",       emoji: "📌" },
];

// トップページ
// カテゴリ選択 → マップ一覧（絞り込み済み）へ遷移するのがメインの動線
function HomePage() {
  const navigate = useNavigate();

  // カテゴリを選んだら /maps?category=xxx に遷移する
  const handleCategoryClick = (categoryId) => {
    navigate(`/maps?category=${categoryId}`);
  };

  return (
    <div>
      {/* キャッチコピー（シンプルに） */}
      <section className="hero">
        <h1>好きな場所を、みんなと共有しよう</h1>
        <p>カテゴリを選んで、お気に入りのスポットマップを探してみよう</p>
      </section>

      {/* ===== カテゴリフィルター（メイン） ===== */}
      <section>
        <h2 className="section-title">カテゴリから探す</h2>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="category-card"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className="category-card__emoji">{cat.emoji}</span>
              <span className="category-card__label">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
