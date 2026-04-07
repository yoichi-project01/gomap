// マップ関連のビジネスロジック
// 今は仮データを返す。後で Supabase クライアントに置き換える

// 仮のデータ（Supabase 接続後に削除する）
const dummyMaps = [
  { id: "1", title: "東京カフェ巡り", description: "おすすめカフェをまとめました" },
  { id: "2", title: "大阪グルメ", description: "食べ歩きスポット集" },
];

// マップ一覧を取得する
export async function fetchAllMaps() {
  // TODO: return await supabase.from('maps').select('*')
  return dummyMaps;
}

// 特定のマップを取得する
export async function fetchMapById(id) {
  // TODO: return await supabase.from('maps').select('*').eq('id', id).single()
  return dummyMaps.find((m) => m.id === id) || null;
}

// マップを新規作成する
export async function insertMap({ title, description }) {
  // TODO: return await supabase.from('maps').insert({ title, description }).select().single()
  const newMap = { id: String(Date.now()), title, description };
  dummyMaps.push(newMap);
  return newMap;
}
