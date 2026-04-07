# Go！map — CLAUDE.md

Claude にコードを依頼するときに読んでもらう、このプロジェクト専用の指示書です。

---

## プロジェクト概要

「Go！map」は、ユーザーが自由なテーマでマップを作成し、
お気に入りのスポットを登録・共有できる Web アプリです。

---

## 技術構成

| 役割 | 技術 |
|------|------|
| フロントエンド | React + Vite |
| バックエンド | Node.js + Express |
| データベース | Supabase |
| 地図 | Google Maps API |
| バージョン管理 | Git / GitHub |

---

## フォルダ構成

```
map-app/
├── frontend/          # React + Vite アプリ
│   └── src/
│       ├── components/  # 再利用可能なUIパーツ
│       ├── pages/       # 各ページ（1ページ1ファイル）
│       ├── routes/      # ルーティング設定
│       ├── layouts/     # ヘッダー・フッター等の共通レイアウト
│       ├── services/    # バックエンドへのAPI通信
│       ├── hooks/       # カスタムフック
│       └── styles/      # グローバルCSS
├── backend/           # Express サーバー
│   └── src/
│       ├── routes/      # URLと処理の対応表
│       ├── controllers/ # リクエストを受け取り、serviceを呼ぶ
│       ├── services/    # ビジネスロジック（DBアクセスもここ）
│       ├── middlewares/ # 認証など共通処理
│       └── config/      # Supabase等の設定
├── docs/              # 設計書・仕様書
├── CLAUDE.md          # この指示書
├── README.md          # 開発者向けセットアップ手順
└── .gitignore
```

---

## チーム開発ルール

- `main` ブランチへの直接プッシュは禁止。必ずブランチを切って PR を出す
- ブランチ名は `feature/機能名`（例: `feature/map-create`）
- PR はレビューを1人以上に依頼してからマージする
- コミットメッセージは日本語OK。何を変えたか簡潔に書く

---

## 命名ルール

- **ファイル名**: コンポーネントは PascalCase（例: `MapCard.jsx`）、それ以外は camelCase（例: `api.js`）
- **変数・関数名**: camelCase（例: `getUserMaps`）
- **CSS クラス名**: kebab-case（例: `map-card`）
- **API エンドポイント**: kebab-case（例: `/api/user-maps`）

---

## Claude へのコード依頼の前提

このプロジェクトで Claude にコードを依頼するときは、以下を守ってください。

### 1. 初心者でも理解しやすいコードを優先する
- 短くてかっこいいコードより、長くても読みやすいコードを書く
- 変数名・関数名は省略せず、意味が伝わる名前にする
- 一つの関数が一つのことだけをやるようにする

### 2. フロントとバックを明確に分離する
- フロントエンドはUIの表示に集中する。データ加工ロジックはバックに寄せる
- API 通信は必ず `src/services/api.js` を経由する
- バックエンドのビジネスロジックは `services/` に書き、`controllers/` には書かない

### 3. コメントは必要最低限だが分かりやすく書く
- 「何をしているか」ではなく「なぜこうしているか」を書く
- `TODO:` コメントは後で実装する箇所に使う
- 全行にコメントは書かない。難しい箇所だけ書く

---

## 現在の状態（骨組みフェーズ）

- 各 API は仮レスポンスを返している
- Supabase・Google Maps API はまだ未接続
- 認証（ログイン状態管理）は未実装
