// 認証チェック用ミドルウェア
// ログインが必要なルートに設定する
// 今は仮実装。Supabase JWT 検証に後で置き換える

export function requireAuth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "ログインが必要です" });
  }

  // TODO: Supabase の JWT トークンを検証する
  // const { data: user, error } = await supabase.auth.getUser(token)

  // 仮のユーザー情報をリクエストに付与する
  req.user = { id: "dummy-user-id" };
  next();
}
