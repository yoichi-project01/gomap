# Go! Map

現在地を表示・スポットを登録できる地図アプリ

---

## 開発を始める前に

### 必要なもの

- Node.js 18以上
- `.env.local` ファイル（後述）

### セットアップ手順

```bash
# 1. パッケージをインストール
npm install

# 2. .env.local を作成して必要なキーを入力（下記参照）

# 3. 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:2200 を開くと地図が表示されます。

---

## 環境変数の設定

プロジェクト直下に `.env.local` ファイルを作成し、以下を記入してください。  
このファイルはGit管理対象外のため、各自で作成が必要です。

```
# Google Maps APIキー（フロントエンド用）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=ここにキーを入力

# Supabase（バックエンド用）
SUPABASE_URL=ここにURLを入力
SUPABASE_SERVICE_ROLE_KEY=ここにキーを入力
```

APIキーの取得方法はPMに確認してください。

---

## フォルダ構成

```
gomap/
├── app/
│   ├── layout.tsx          # 全ページ共通のレイアウト
│   ├── page.tsx            # トップページ（/）
│   ├── (routes)/           # 各ページをここに追加していく
│   │   └── spots/
│   │       └── page.tsx    # スポット一覧ページ（/spots）
│   └── api/                # APIエンドポイント（バックエンド担当）
│       └── spots/
│           └── route.ts    # GET /api/spots, POST /api/spots
│
├── components/             # UIパーツ（フロントエンド担当）
│   └── MapView.tsx         # 地図コンポーネント
│
├── lib/
│   ├── client/             # APIを呼び出す関数（フロントエンド担当）
│   │   └── spots.ts        # getSpots(), createSpot() など
│   └── server/             # DB操作（バックエンド担当）
│       └── supabase.ts     # Supabaseクライアント
│
└── types/                  # 型定義（全員共通・変更時は要相談）
    └── spot.ts             # Spot型など
```

---

## 担当範囲

| フォルダ | 担当 |
|---|---|
| `app/(routes)/` | フロントエンド |
| `components/` | フロントエンド |
| `lib/client/` | フロントエンド |
| `app/api/` | バックエンド |
| `lib/server/` | バックエンド |
| `types/` | 全員共通（変更時は必ず相談） |

---

## ファイルを追加するときのルール

### 新しいページを追加する場合（フロントエンド）

`app/(routes)/ページ名/page.tsx` を作成する。

例：マイページ（`/mypage`）を追加したい場合
```
app/(routes)/mypage/page.tsx
```

### 新しいUIパーツを追加する場合（フロントエンド）

`components/` に作成する。

例：スポットのカード表示
```
components/SpotCard.tsx
```

### 新しいAPIを追加する場合（バックエンド）

`app/api/エンドポイント名/route.ts` を作成し、DB処理は `lib/server/` に書く。

例：ユーザー情報API（`/api/users`）を追加したい場合
```
app/api/users/route.ts     # エンドポイント
lib/server/users.ts        # Supabaseへのクエリ
```

### 型を追加・変更する場合（全員共通）

`types/` のファイルを変更する。  
フロントとバックエンド両方に影響するため、**変更前にチームに共有すること**。

---

## 技術スタック

| 用途 | 技術 |
|---|---|
| フレームワーク | Next.js 16 |
| 地図 | Google Maps API（@vis.gl/react-google-maps） |
| DB | Supabase |
| スタイル | Tailwind CSS |
| 言語 | TypeScript |
