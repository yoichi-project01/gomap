import { useState } from "react";
import MapCard from "../components/MapCard";

// マイページ（ログインユーザー専用）
// プロフィール + タブ切り替え（自分のマップ / いいねしたマップ）
function MyPage() {
  const [activeTab, setActiveTab] = useState("myMaps");

  // 仮ユーザー情報（認証実装後に置き換える）
  const user = { name: "テストユーザー", email: "test@example.com" };

  // 仮データ（API接続後に置き換える）
  const myMaps = [
    { id: "1", title: "東京カフェ巡り", description: "お気に入りカフェをまとめました", likeCount: 5, spotCount: 3 },
    { id: "2", title: "大阪グルメ", description: "食べ歩きスポット", likeCount: 2, spotCount: 7 },
  ];
  const likedMaps = [
    { id: "3", title: "京都観光マップ", description: "定番スポット集", likeCount: 12, spotCount: 10 },
  ];

  const displayMaps = activeTab === "myMaps" ? myMaps : likedMaps;

  return (
    <div>
      {/* プロフィールボックス */}
      <div className="profile-box">
        <div className="profile-avatar">👤</div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
        {/* TODO: プロフィール編集ボタン */}
        <button className="btn btn--outline" style={{ marginLeft: "auto" }}>
          編集
        </button>
      </div>

      {/* タブ切り替え */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "myMaps" ? "active" : ""}`}
          onClick={() => setActiveTab("myMaps")}
        >
          自分のマップ ({myMaps.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "likedMaps" ? "active" : ""}`}
          onClick={() => setActiveTab("likedMaps")}
        >
          いいねしたマップ ({likedMaps.length})
        </button>
      </div>

      {/* タブの中身 */}
      {displayMaps.length === 0 ? (
        <div className="empty-state">
          <p>まだありません</p>
        </div>
      ) : (
        <div className="card-grid">
          {displayMaps.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPage;
