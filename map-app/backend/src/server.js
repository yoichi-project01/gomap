import "dotenv/config"; // .env ファイルを読み込む
import app from "./app.js";

const PORT = process.env.PORT || 2200;

// サーバーを起動する
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
