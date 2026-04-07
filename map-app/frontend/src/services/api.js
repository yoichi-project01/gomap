// API通信をまとめたファイル
// バックエンドへのリクエストはすべてここに書く
// fetch() の代わりに後で axios に変えることも可能

const BASE_URL = "http://localhost:2200/api"; // バックエンドのURL

// マップ一覧を取得する
export async function getMaps() {
  const res = await fetch(`${BASE_URL}/maps`);
  if (!res.ok) throw new Error("マップ一覧の取得に失敗しました");
  return res.json();
}

// 特定のマップを取得する
export async function getMapById(id) {
  const res = await fetch(`${BASE_URL}/maps/${id}`);
  if (!res.ok) throw new Error("マップの取得に失敗しました");
  return res.json();
}

// 新しいマップを作成する
export async function createMap(mapData) {
  const res = await fetch(`${BASE_URL}/maps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapData),
  });
  if (!res.ok) throw new Error("マップの作成に失敗しました");
  return res.json();
}

// ログイン
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("ログインに失敗しました");
  return res.json();
}

// 会員登録
export async function signup(username, email, password) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw new Error("会員登録に失敗しました");
  return res.json();
}
