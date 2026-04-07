// マップ詳細で使うスポットカードコンポーネント
// props: spot = { id, name, description }
function SpotCard({ spot }) {
  return (
    <div className="spot-card">
      {/* スポット画像（実装まではプレースホルダー） */}
      <div className="spot-card__thumbnail">
        <span>📷</span>
      </div>

      <div className="spot-card__body">
        <p className="spot-card__name">{spot.name}</p>
        <p className="spot-card__desc">
          {spot.description || "説明はありません"}
        </p>
      </div>
    </div>
  );
}

export default SpotCard;
