import { useState } from "react";
import { Link } from "react-router-dom";

// 会員登録ページ
function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // TODO: services/api.js の signup() を呼び出す
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("登録試行:", { username, email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>会員登録</h1>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
              required
            />
          </div>

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
              placeholder="6文字以上"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary">
            登録する
          </button>
        </form>

        <p className="auth-link">
          すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
