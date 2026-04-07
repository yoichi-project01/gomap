import express from "express";
import cors from "cors";
import router from "./routes/index.js";

// Express アプリの設定ファイル
// ミドルウェアとルートをここで登録する
const app = express();

// JSON リクエストを受け取れるようにする
app.use(express.json());

// フロントエンド（localhost:5173）からのリクエストを許可する
app.use(cors({ origin: "http://localhost:2100" }));

// すべての API ルートを /api 以下で受け取る
app.use("/api", router);

export default app;
