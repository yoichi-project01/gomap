import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import MapListPage from "../pages/MapListPage";
import MapDetailPage from "../pages/MapDetailPage";
import MapCreatePage from "../pages/MapCreatePage";
import MyPage from "../pages/MyPage";

// アプリ全体のルーティング定義
// パスとページコンポーネントの対応をここで管理する
function AppRoutes() {
  return (
    <Routes>
      {/* MainLayout を使う画面群 */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/maps" element={<MapListPage />} />
        <Route path="/maps/:id" element={<MapDetailPage />} />
        <Route path="/maps/create" element={<MapCreatePage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Route>

      {/* レイアウトなし（ログイン・会員登録画面） */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}

export default AppRoutes;
