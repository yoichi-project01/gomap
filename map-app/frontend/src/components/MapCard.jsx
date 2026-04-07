import { Link } from "react-router-dom";

// マップ一覧で使うカードコンポーネント
// props: map = { id, title, description, likeCount, spotCount }
function MapCard({ map }) {
  return (
    <Link to={`/maps/${map.id}`} className="card map-card">
      {/* サムネイル画像エリア（画像実装まではプレースホルダー） */}
      <div className="map-card__thumbnail">
        <span>🗺️ 画像なし</span>
      </div>

      <div className="map-card__body">
        <h3 className="map-card__title">{map.title}</h3>
        <p className="map-card__desc">
          {map.description || "説明はありません"}
        </p>
        <div className="map-card__meta">
          <span>♡ {map.likeCount ?? 0}</span>
          <span>📍 {map.spotCount ?? 0} スポット</span>
        </div>
      </div>
    </Link>
  );
}

export default MapCard;
