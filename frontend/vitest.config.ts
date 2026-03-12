import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // tsconfig.jsonのパス設定（@/*など）を読み込む
  ],
  test: {
    environment: "happy-dom", // ブラウザ環境をシミュレート
    globals: true, // describe, it, expectなどをimportなしで使えるようにする場合（お好みで）
    setupFiles: ["./test/setup.ts"], // セットアップファイルの場所を指定
    include: ["**/*.test.{ts,tsx}"], // テストファイルの対象パターン
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/app/**/layout.tsx",
        "src/app/**/loading.tsx",
        "**/*.d.ts",
        "test/**",
      ],
    },
  },
});
