import { useState } from "react";
import { useNavigate } from "react-router-dom";

// マップ作成ページ（ログインユーザー専用）
// 左：入力フォーム / 右：地図エリア（2カラム）
function MapCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // TODO: services/api.js の createMap() を呼び出す
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("マップ作成:", { title, description });
    navigate("/maps");
  };

  return (
    <div>
      <div className="page-header">
        <h1>新しいマップを作る</h1>
      </div>

      {/* 2カラムレイアウト（スマホでは縦積み） */}
      <div className="create-layout">

        {/* ===== 左カラム：入力フォーム ===== */}
        <div className="card" style={{ padding: "24px" }}>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">マップタイトル *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 東京カフェ巡り"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">説明</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="このマップのテーマや説明を書いてください"
              />
            </div>

            {/* TODO: サムネイル画像アップロード */}
            <div className="form-group">
              <label>サムネイル画像</label>
              <div
                style={{
                  border: "2px dashed var(--color-border)",
                  borderRadius: "var(--radius)",
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--color-muted)",
                  fontSize: "0.9rem",
                }}
              >
                📷 画像アップロード（実装予定）
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>
                作成する
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => navigate(-1)}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>

        {/* ===== 右カラム：地図エリア（スポット位置選択） ===== */}
        <div>
          <p className="section-title">スポットの場所を選ぶ</p>
          <div className="map-area" style={{ minHeight: "480px" }}>
            <span style={{ fontSize: "2rem" }}>🗺️</span>
            <p>地図をクリックしてスポットを追加</p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-primary)" }}>
              （Google Maps API 接続後に切り替え）
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MapCreatePage;
