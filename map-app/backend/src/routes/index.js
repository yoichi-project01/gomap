import { Router } from "express";
import mapsRouter from "./maps.js";
import authRouter from "./auth.js";

// ルートをまとめるファイル
// 新しい機能を追加するときはここにルーターを追加する
const router = Router();

// ヘルスチェック（サーバーが動いているか確認用）
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "サーバーは正常に動作しています" });
});

// マップ関連のルート
router.use("/maps", mapsRouter);

// 認証関連のルート
router.use("/auth", authRouter);

export default router;
