import { Router } from "express";
import { getAllMaps, getMapById, createMap } from "../controllers/mapsController.js";

// マップ関連のエンドポイント定義
const router = Router();

// GET /api/maps - マップ一覧取得（ログイン不要）
router.get("/", getAllMaps);

// GET /api/maps/:id - マップ詳細取得（ログイン不要）
router.get("/:id", getMapById);

// POST /api/maps - マップ作成（ログイン必要）
// TODO: authMiddleware を追加してログインチェックをする
router.post("/", createMap);

export default router;
