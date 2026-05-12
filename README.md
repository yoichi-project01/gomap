# Go! Map

現在地を表示・プレイスリストを作成できる地図アプリ

---

## 開発を始める前に

### 必要なもの

- Node.js 18以上
- `.env.local` ファイル（後述）

### セットアップ手順

```bash
# 1. パッケージをインストール
npm install
npm install lucide-react

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
# Supabase - サーバー側
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ここに service_role キーを入力

# Supabase - クライアント側 (Auth に必要)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ここに anon キーを入力
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=gomap-images

# サイト URL (確認メール / パスワード再設定リンクで使用)
# 本番では本番ドメインに差し替え
NEXT_PUBLIC_SITE_URL=http://localhost:2200
```

APIキーの取得方法はPMに確認してください。

---

## 認証機能

### 開発時のセットアップ

1. Supabase Dashboard > **Authentication > Sign In / Providers > Email**
   - 「Confirm email」を **OFF**（開発中はサインアップ即ログインで楽）
2. Supabase Dashboard > **Authentication > URL Configuration**
   - Site URL: `http://localhost:2200`
   - Redirect URLs: `http://localhost:2200/**`
3. Supabase Dashboard > **SQL Editor** で `supabase/migrate_all.sql` を 1 回貼り付けて Run

### 本番デプロイ前のチェック

| 項目 | 内容 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 本番ドメイン（例: `https://gomap.example.com`）に変更 |
| Supabase Site URL | 同上 |
| Supabase Redirect URLs | 本番ドメインの `/**` を追加 |
| 「Confirm email」 | **ON** に戻す（メール所有確認を強制） |
| SMTP 設定 | Supabase Cloud のデフォルト SMTP は test 用途のみ。本番は独自 SMTP を設定 |
| `SUPABASE_SERVICE_ROLE_KEY` | 本番環境変数に **絶対**クライアントへ漏らさない形で設定 |

### 認証フロー一覧

| 機能 | パス |
|---|---|
| ログイン | `/login` |
| 新規登録 | `/signup` |
| パスワード再設定（メール送信） | `/forgot-password` |
| 新パスワード設定（メールリンクから） | `/auth/update-password` |
| ログアウト | `/mypage` 内ボタン |
| アカウント削除 | `/mypage` 内ボタン（service_role で完全削除） |

### 認証で保護されたルート

`proxy.ts` の `PROTECTED_PREFIXES` で定義：`/mypage`, `/mylibrary`, `/spots/create`, `/placelists/create`

---

## フォルダ構成

```
gomap/
├── app/
│   ├── layout.tsx              # 全ページ共通のレイアウト + テーマ初期化スクリプト
│   ├── page.tsx                # ホーム (/) — DB のプレイスリスト一覧 + 絞り込み結果表示
│   ├── (auth)/                 # 認証フロー (login / signup / forgot-password)
│   │   └── layout.tsx
│   ├── (routes)/               # アプリ本体のページ群
│   │   ├── filter/             # 絞り込み条件入力 (/filter)
│   │   ├── mylibrary/          # マイライブラリ (登録 / 保存 / いいね)
│   │   ├── mypage/             # ユーザー設定 + 統計
│   │   ├── placelists/         # プレイスリスト詳細・作成
│   │   └── spots/              # スポット詳細・作成・コレクション表示
│   ├── actions/                # サーバーアクション (auth / likes / saves / favorites)
│   ├── api/
│   │   ├── auth/callback/      # Supabase Auth コールバック
│   │   ├── places/search/      # OSM Nominatim 経由の場所検索
│   │   ├── placelists/         # GET/POST /api/placelists, GET/DELETE /:id
│   │   └── spots/              # GET/POST /api/spots, GET/DELETE /:id
│   └── auth/update-password/   # メールリンクからのパスワード再設定
│
├── components/
│   ├── home/                   # ホーム画面用 (HomeHeader, RecentPlaceLists, ...)
│   ├── spot/                   # スポット詳細用 (SpotActions, LocationSearchModal)
│   ├── collection/             # コレクション画面用 (CollectionActions)
│   ├── ui/                     # 汎用 UI (BottomNav, ThemeToggle, CoverImageUploader)
│   ├── SpotDetailMap*          # 単一スポット地図
│   ├── SpotMiniMap*            # サムネイル用ミニ地図
│   └── PlaceListMap*           # 複数ピン地図
│
├── lib/
│   ├── client/                 # ブラウザから API を叩く関数
│   │   ├── spots.ts            # getSpots / getSpotById / createSpot / deleteSpot
│   │   ├── placeLists.ts       # getPlaceLists / createPlaceList / deletePlaceList
│   │   ├── supabaseBrowser.ts  # ブラウザ用 Supabase クライアント (auth 用)
│   │   └── uploadCover.ts      # Storage への画像アップロード
│   ├── server/                 # サーバー側 DB アクセス層
│   │   ├── supabase.ts         # service_role Supabase クライアント
│   │   ├── supabaseAuth.ts     # cookies 経由の auth 連携クライアント
│   │   ├── spots.ts            # listSpots / getSpotById / createSpot / ...
│   │   ├── placeLists.ts       # listPlaceLists / getPlaceListById / ...
│   │   ├── favorites.ts        # スポットお気に入り
│   │   ├── likes.ts            # プレイスリストいいね
│   │   ├── saves.ts            # プレイスリスト保存 (ブックマーク)
│   │   └── stats.ts            # ユーザー統計
│   ├── filter/                 # クライアント側絞り込みロジック
│   └── hooks/                  # 共通 React フック
│
├── proxy.ts                    # Supabase セッション更新 + 保護ルート (旧 middleware)
│
├── supabase/
│   ├── migrate_all.sql         # 1 ファイル統合マイグレーション(これを実行すれば全部入る)
│   ├── schema.sql              # 基本スキーマ
│   ├── 02_likes_favorites.sql  # likes / favorites
│   ├── 03_storage_covers.sql   # Storage バケット + cover_image_url
│   ├── 04_place_list_saves.sql # プレイスリスト保存 (ブックマーク)
│   └── seed.sql                # 編集部ダミーデータ
│
└── types/
    └── spot.ts                 # Spot, PlaceList 型
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
| 地図 | leaflet(react-leaflet) |
| DB | Supabase |
| スタイル | Tailwind CSS |
| 言語 | TypeScript |
