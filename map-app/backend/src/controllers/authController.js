import { loginUser, signupUser } from "../services/authService.js";

// ログイン処理
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "メールとパスワードは必須です" });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "ログインに失敗しました" });
  }
}

// 会員登録処理
export async function signup(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "全ての項目を入力してください" });
    }
    const result = await signupUser(username, email, password);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "会員登録に失敗しました" });
  }
}
