// スポット（地図上のピン）の型定義
// フロントエンド・バックエンド共通で使用する

export type Spot = {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  createdAt: string;
  createdBy: string; // ユーザーID
};

// スポット新規作成時の入力型（idとcreatedAtはサーバー側で付与）
export type CreateSpotInput = Omit<Spot, "id" | "createdAt">;
