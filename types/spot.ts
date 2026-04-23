// 地点（道頓堀、大阪城などの具体的なピン）
export type Location = {
  id: string;
  name: string;
  desc: string;
  lat: number;
  lng: number;
};

// スポット（大阪観光名所7選などの、地点をまとめたコレクション）
export type SpotCollection = {
  id: string;
  name: string;
  description: string;
  creator?: string;
  likes?: number;
  locations: Location[];
};