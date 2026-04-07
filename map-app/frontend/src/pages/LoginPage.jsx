import { useState } from "react";
import { Link } from "react-router-dom";

// ログインページ
// MainLayout の外（レイアウトなし）で表示される
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // TODO: services/api.js の login() を呼び出す
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ログイン試行:", { email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>ログイン</h1>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary">
            ログイン
          </button>
        </form>

        <p className="auth-link">
          アカウントをお持ちでない方は <Link to="/signup">会員登録</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
