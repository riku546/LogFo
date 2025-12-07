// test/setup.ts
import "@testing-library/jest-dom"; // DOM判定用のマッチャーを拡張
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 各テストケース終了後にコンポーネントをアンマウントしてクリーンアップ
afterEach(() => {
  cleanup();
});
