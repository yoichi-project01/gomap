import { useState } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";

// 全ページ共通のレイアウト
// ヘッダー・メイン・フッターの3層構造
function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="layout">
      {/* ======= ヘッダー ======= */}
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo" onClick={closeMenu}>
            Go！map
          </Link>

          {/* ハンバーガーボタン（スマホのみ表示） */}
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニューを開閉する"
          >
            <span />
            <span />
            <span />
          </button>

          {/* ナビゲーション
              PC: 横並び表示
              スマホ: menuOpen が true のときだけ表示 */}
          <nav className={`nav ${menuOpen ? "nav--open" : ""}`}>
            <NavLink to="/" end onClick={closeMenu}>
              ホーム
            </NavLink>
            <NavLink to="/maps" onClick={closeMenu}>
              マップ一覧
            </NavLink>
            <NavLink to="/maps/create" onClick={closeMenu}>
              マップを作る
            </NavLink>
            <NavLink to="/mypage" onClick={closeMenu}>
              マイページ
            </NavLink>
            {/* 区切り線（スマホメニューのみ表示） */}
            <hr className="nav-divider" />
            <NavLink to="/login" onClick={closeMenu}>
              ログイン
            </NavLink>
            <NavLink to="/signup" className="nav-signup" onClick={closeMenu}>
              会員登録
            </NavLink>
          </nav>
        </div>
      </header>

      {/* ======= メインコンテンツ ======= */}
      <main className="main">
        {/* 各ページがここに表示される */}
        <Outlet />
      </main>

      {/* ======= フッター ======= */}
      <footer className="footer">
        <p>© 2025 Go！map</p>
      </footer>
    </div>
  );
}

export default MainLayout;
