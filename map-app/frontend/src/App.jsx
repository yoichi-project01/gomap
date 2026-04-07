import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";

// アプリのルートコンポーネント
// BrowserRouter でアプリ全体をラップしてルーティングを有効にする
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
