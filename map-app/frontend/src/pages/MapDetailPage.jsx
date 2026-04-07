import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SpotCard from "../components/SpotCard";
import { getMapById } from "../services/api";

// マップ詳細ページ
// 地図エリアを主役にし、スポット一覧・いいね・コメントを縦に並べる
function MapDetailPage() {
  const { id } = useParams();
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");

  // 仮スポットデータ（API接続後に削除）
  const dummySpots = [
    { id: "1", name: "スポット A", description: "おすすめの理由を書く場所" },
    { id: "2", name: "スポット B", description: "おすすめの理由を書く場所" },
  ];

  // 仮コメントデータ（API接続後に削除）
  const dummyComments = [
    { id: "1", author: "ユーザー A", body: "とても参考になりました！" },
    { id: "2", author: "ユーザー B", body: "行ってみます！" },
  ];

  useEffect(() => {
    getMapById(id)
      .then((data) => setMap(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // TODO: バックエンドの いいね API を呼び出す
  const handleLike = () => setLiked(!liked);

  // TODO: バックエンドの コメント投稿 API を呼び出す
  const handleComment = (e) => {
    e.preventDefault();
    console.log("コメント投稿:", comment);
    setComment("");
  };

  if (loading) return <p>読み込み中...</p>;
  if (!map) return <p>マップが見つかりません</p>;

  return (
    <div>
      {/* マップ名・説明 */}
      <div className="page-header">
        <div>
          <h1>{map.title}</h1>
          <p style={{ color: "var(--color-muted)", marginTop: "4px" }}>
            {map.description}
          </p>
        </div>
        {/* TODO: 自分のマップのみ表示する */}
        <Link to={`/maps/${id}/edit`} className="btn btn--outline">
          編集
        </Link>
      </div>

      {/* ===== 地図エリア（主役） ===== */}
      <div className="map-area map-area--fullwidth">
        <span style={{ fontSize: "2rem" }}>🗺️</span>
        <p>Google Maps がここに表示されます</p>
        <p style={{ fontSize: "0.85rem", color: "var(--color-primary)" }}>
          （Google Maps API 接続後に切り替え）
        </p>
      </div>

      {/* ===== スポット一覧 ===== */}
      <section className="mt-6">
        <div className="page-header">
          <h2 className="section-title">スポット一覧</h2>
          {/* TODO: ログインユーザーのみ表示 */}
          <button className="btn btn--primary">+ スポットを追加</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {dummySpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </section>

      {/* ===== いいねエリア ===== */}
      <section className="mt-6">
        <h2 className="section-title">いいね</h2>
        <div className="like-area">
          {/* TODO: ログインユーザーのみ押せるようにする */}
          <button
            className={`like-btn ${liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            ♡ いいね
          </button>
          <span className="like-count">
            {liked ? "1" : "0"} 件のいいね
          </span>
        </div>
      </section>

      {/* ===== コメントエリア ===== */}
      <section className="mt-6">
        <h2 className="section-title">コメント</h2>
        <div className="comment-area">
          {/* コメント投稿フォーム（ログインユーザーのみ） */}
          {/* TODO: 未ログイン時は「ログインしてコメントする」リンクを表示 */}
          <form className="comment-form" onSubmit={handleComment}>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを入力..."
            />
            <button type="submit" className="btn btn--primary">
              送信
            </button>
          </form>

          {/* コメント一覧 */}
          <div className="comment-list">
            {dummyComments.map((c) => (
              <div key={c.id} className="comment-item">
                <p className="comment-item__author">{c.author}</p>
                <p className="comment-item__body">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default MapDetailPage;
