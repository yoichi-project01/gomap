# Go！map

お気に入りのスポットをマップで共有できる Web アプリです。
カテゴリから探したり、自分でマップを作ってスポットを登録・共有できます。

---

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [使用技術](#使用技術)
3. [フォルダ構成](#フォルダ構成)
4. [はじめにやること（全員共通）](#はじめにやること全員共通)
5. [フロントエンド班へ](#フロントエンド班へ)
6. [バックエンド班へ](#バックエンド班へ)
7. [API一覧](#api一覧)
8. [開発ルール](#開発ルール)
9. [今後の開発フェーズ](#今後の開発フェーズ)
10. [困ったときは](#困ったときは)

---

## プロジェクト概要

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| アプリ名 | Go！map                                                            |
| 目的     | お気に入りスポットをテーマ別マップで共有する                       |
| 対象端末 | PC・スマートフォン（レスポンシブ対応）                             |
| 認証     | 未ログインでも閲覧OK、マップ作成・いいね・コメントはログインが必要 |

### 画面一覧

| 画面名     | URL            | 説明                               |
| ---------- | -------------- | ---------------------------------- |
| ホーム     | `/`            | カテゴリ選択トップ                 |
| マップ一覧 | `/maps`        | カテゴリ・検索で絞り込み           |
| マップ詳細 | `/maps/:id`    | 地図・スポット・いいね・コメント   |
| マップ作成 | `/maps/create` | マップ＋スポット登録（要ログイン） |
| マイページ | `/mypage`      | 自分のマップ・いいね一覧           |
| ログイン   | `/login`       |                                    |
| 会員登録   | `/signup`      |                                    |

---

## 使用技術

| 役割           | 技術                   | バージョン目安    |
| -------------- | ---------------------- | ----------------- |
| フロントエンド | React + Vite           | React 18 / Vite 6 |
| ルーティング   | React Router           | v6                |
| バックエンド   | Node.js + Express      | Node 18以上       |
| データベース   | Supabase（PostgreSQL） | —                 |
| 地図           | Google Maps API        | —                 |
| 同時起動       | concurrently           | —                 |

---

## フォルダ構成

```
map-app/
├── frontend/                  # 画面（React + Vite）
│   ├── src/
│   │   ├── components/        # 複数ページで使い回すUIパーツ
│   │   │   ├── MapCard.jsx    # マップ一覧のカード
│   │   │   └── SpotCard.jsx   # スポット表示カード
│   │   ├── pages/             # 各ページ（1ページ = 1ファイル）
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── MapListPage.jsx
│   │   │   ├── MapDetailPage.jsx
│   │   │   ├── MapCreatePage.jsx
│   │   │   └── MyPage.jsx
│   │   ├── routes/            # URLとページの対応表
│   │   │   └── index.jsx
│   │   ├── layouts/           # ヘッダー・フッターなど共通レイアウト
│   │   │   └── MainLayout.jsx
│   │   ├── services/          # バックエンドへのAPI通信（fetch処理）
│   │   │   └── api.js
│   │   ├── hooks/             # カスタムフック置き場（今後追加）
│   │   └── styles/            # グローバルCSS
│   │       └── global.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                   # サーバー（Node.js + Express）
│   ├── src/
│   │   ├── routes/            # URLと処理の対応表
│   │   │   ├── index.js       # ルートをまとめる
│   │   │   ├── maps.js        # /api/maps 系
│   │   │   └── auth.js        # /api/auth 系
│   │   ├── controllers/       # リクエストを受け取りserviceを呼ぶ
│   │   │   ├── mapsController.js
│   │   │   └── authController.js
│   │   ├── services/          # ビジネスロジック・DBアクセス
│   │   │   ├── mapsService.js
│   │   │   └── authService.js
│   │   ├── middlewares/       # 認証チェックなど共通処理
│   │   │   └── authMiddleware.js
│   │   ├── config/            # Supabaseなど外部サービスの設定
│   │   │   └── supabase.js
│   │   ├── app.js             # Expressの設定（ミドルウェア登録）
│   │   └── server.js          # サーバー起動
│   ├── .env.example           # 環境変数のサンプル
│   └── package.json
│
├── docs/                      # 設計書・仕様書（自由に追加してOK）
├── package.json               # ルート：frontend + backend の同時起動
├── CLAUDE.md                  # Claude AI への指示書
├── README.md                  # この説明書
└── .gitignore
```

---

## はじめにやること（全員共通）

### 1. Node.js のインストール確認

```bash
node -v   # 18以上であればOK
npm -v
```

### 2. リポジトリをクローン

```bash
git clone https://github.com/your-org/map-app.git
cd map-app
```

### 3. 全パッケージをインストール

```bash
# ルート（concurrently）
npm install

# フロントエンド
cd frontend && npm install && cd ..

# バックエンド
cd backend && npm install && cd ..
```

### 4. 環境変数ファイルを作成

```bash
cd backend
cp .env.example .env
```

`.env` をテキストエディタで開き、Supabase の情報を入力します（後で設定するまで空でもOK）。

### 5. 起動する

```bash
# map-app フォルダで実行
npm run dev
```

これだけで **frontend（:2100）** と **backend（:2200）** が同時に起動します。

| サーバー       | URL                   |
| -------------- | --------------------- |
| フロントエンド | http://localhost:2100 |
| バックエンド   | http://localhost:2200 |

#### 個別に起動したい場合

```bash
npm run dev:frontend   # frontend のみ
npm run dev:backend    # backend のみ
```

#### 動作確認

ブラウザで http://localhost:2100 を開くと画面が表示されます。

バックエンドの確認：

```bash
curl http://localhost:2200/api/health
# → {"status":"ok","message":"サーバーは正常に動作しています"}
```

---

## フロントエンド班へ

### 担当フォルダ

```
frontend/src/
├── pages/       ← 各ページの実装（メイン作業場）
├── components/  ← 使い回すUIパーツを作る
├── services/    ← バックエンドへのAPI通信（api.js）
├── hooks/       ← カスタムフック（useAuthなど）
└── styles/      ← デザイン調整
```

### 開発の流れ

1. `pages/` の各ページを開く
2. `TODO:` コメントを探す → そこが次の実装箇所
3. バックエンドへのデータ取得は必ず `services/api.js` を経由する
4. 新しいUIパーツは `components/` に切り出す

### API通信のルール

バックエンドへのリクエストは **すべて `services/api.js` に書く**。
ページの中に `fetch()` を直接書かない。

```js
// ✅ 良い例（pages/MapListPage.jsx）
import { getMaps } from "../services/api";
const maps = await getMaps();

// ❌ 悪い例
const res = await fetch("http://localhost:2200/api/maps");
```

### ルーティングの追加方法

新しいページを追加する場合は `routes/index.jsx` に追記します。

```jsx
// routes/index.jsx に追加する例
<Route path="/maps/:id/edit" element={<MapEditPage />} />
```

### 現在の仮データについて

バックエンドが Supabase と未接続の間は、各ページに仮データ（`dummyXxx`）が書いてあります。
API 接続後に差し替えていく予定です。

---

## バックエンド班へ

### 担当フォルダ

```
backend/src/
├── services/     ← ビジネスロジック・DBアクセス（メイン作業場）
├── controllers/  ← リクエスト受け取り・レスポンス返却
├── routes/       ← URLと処理の対応
├── middlewares/  ← 認証チェックなど
└── config/       ← Supabase 接続設定
```

### 処理の流れ

```
リクエスト
  ↓
routes/（URLの振り分け）
  ↓
controllers/（値の受け取り・バリデーション）
  ↓
services/（DBアクセス・ビジネスロジック）← ここに実装を集中させる
  ↓
レスポンス
```

### Supabase 接続手順

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `Settings > API` から URL と anon key を取得
3. `backend/.env` に記入

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxx
```

4. `backend/src/config/supabase.js` のコメントアウトを外す
5. `npm install @supabase/supabase-js` を実行

### services/ の実装方法

現在は仮データを返しています。`TODO:` のコメント部分を Supabase クエリに置き換えます。

```js
// mapsService.js の例
export async function fetchAllMaps() {
  // TODO の行を削除して、下の行のコメントを外す
  const { data, error } = await supabase.from("maps").select("*");
  if (error) throw error;
  return data;
}
```

### 新しい API の追加手順

1. `routes/` にエンドポイントを追加
2. `controllers/` にリクエスト処理を追加
3. `services/` にDBアクセスを追加

---

## API一覧

現在は仮レスポンスを返しています。Supabase 接続後に実データに切り替わります。

| メソッド | パス             | 説明             | 認証 | 状態        |
| -------- | ---------------- | ---------------- | ---- | ----------- |
| GET      | /api/health      | サーバー状態確認 | 不要 | ✅ 動作中   |
| GET      | /api/maps        | マップ一覧取得   | 不要 | 🔧 仮データ |
| GET      | /api/maps/:id    | マップ詳細取得   | 不要 | 🔧 仮データ |
| POST     | /api/maps        | マップ作成       | 必要 | 🔧 仮データ |
| POST     | /api/auth/login  | ログイン         | 不要 | 🔧 仮実装   |
| POST     | /api/auth/signup | 会員登録         | 不要 | 🔧 仮実装   |

---

## 開発ルール

### ブランチ運用

```
main        ← 本番用。直接プッシュ禁止
develop     ← 開発の統合ブランチ（あれば）
feature/xxx ← 機能追加（例: feature/map-create）
fix/xxx     ← バグ修正（例: fix/login-error）
```

### 作業の流れ

```bash
# 1. ブランチを作る
git checkout -b feature/map-create

# 2. 実装する

# 3. コミット
git add src/pages/MapCreatePage.jsx
git commit -m "マップ作成ページの入力フォームを実装"

# 4. プッシュしてPRを出す
git push origin feature/map-create
```

### 命名ルール

| 対象                   | ルール     | 例               |
| ---------------------- | ---------- | ---------------- |
| コンポーネントファイル | PascalCase | `MapCard.jsx`    |
| その他のJSファイル     | camelCase  | `api.js`         |
| 変数・関数名           | camelCase  | `getUserMaps`    |
| CSSクラス              | kebab-case | `map-card`       |
| APIパス                | kebab-case | `/api/user-maps` |

### コミットメッセージ

日本語でOK。何をしたか簡潔に書く。

```
✅ マップ一覧のカードUIを実装
✅ ログインAPIのエラーハンドリングを追加
❌ 修正   （何を修正したか分からない）
❌ update （英語でも内容が不明）
```

---

## 今後の開発フェーズ

### フェーズ1（現在）: 骨組み完成

- [x] フォルダ構成・ルーティング整備
- [x] 全画面のUI骨組み作成
- [x] API雛形作成（仮レスポンス）
- [x] frontend・backend の同時起動設定

### フェーズ2: バックエンド実装（バックエンド班）

- [ ] Supabase プロジェクト作成・テーブル設計
- [ ] 認証（ログイン・会員登録）の実装
- [ ] マップの CRUD 実装
- [ ] スポットの CRUD 実装

### フェーズ3: フロントエンド実装（フロントエンド班）

- [ ] Google Maps API の組み込み
- [ ] ログイン状態の管理
- [ ] API との接続（仮データを実データに切り替え）
- [ ] いいね・コメント機能の実装

### フェーズ4: 仕上げ（全員）

- [ ] デザイン調整
- [ ] スマートフォン表示の最終確認
- [ ] テスト・バグ修正

---

## 困ったときは

| 症状                   | 対処法                                      |
| ---------------------- | ------------------------------------------- |
| `npm install` でエラー | Node.js のバージョンを確認（18以上必要）    |
| ポートが使われている   | 他のサーバーを停止してから起動              |
| API が繋がらない       | backend が起動しているか確認（:2200）       |
| 画面が真っ白           | ブラウザの開発者ツール（F12）でエラーを確認 |
