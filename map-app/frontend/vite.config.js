import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite の設定ファイル
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 2100, // このプロジェクト専用ポート
  },
});
