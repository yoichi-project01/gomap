import { Router } from "express";
import { login, signup } from "../controllers/authController.js";

// 認証関連のエンドポイント定義
const router = Router();

// POST /api/auth/login - ログイン
router.post("/login", login);

// POST /api/auth/signup - 会員登録
router.post("/signup", signup);

export default router;
