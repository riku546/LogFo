// test/integration.spec.js (または .ts)
import { applyD1Migrations, env, SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

describe("Worker Integration Test", () => {
  // 2. beforeAll でマイグレーションを実行
  beforeAll(async () => {
    // DrizzleのマイグレーションフォルダからSQLファイルを読み込む
    // ※パスはテストファイルの位置に合わせて調整してください（例: ../../drizzle/*.sql）
    const migrations = import.meta.glob("../../drizzle/*.sql", {
      eager: true,
      query: "?raw",
      import: "default",
    });

    // 読み込んだファイルを applyD1Migrations が受け取れる形式に変換
    const migrationEvents = Object.entries(migrations)
      .sort(([pathA], [pathB]) => pathA.localeCompare(pathB)) // ファイル名順（0000_..., 0001_...）に並び替え
      .map(([path, sql]) => ({
        name: path.split("/").pop() ?? path, // ファイル名をマイグレーション名とする
        queries: [sql as string], // SQLの中身
      }));

    // マイグレーションを適用
    await applyD1Migrations(env.DB, migrationEvents);
  });

  describe("signup endpoint", () => {
    it("正常にサインアップできる", async () => {
      // SELF.fetch を使用して Worker にリクエストを送信
      const response = await SELF.fetch("http://localhost:8787/signup", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          userName: "testuser",
        }),
      });

      expect(response.status).toBe(201);
    });

    it("重複したメールアドレスでサインアップできない", async () => {
      // まず最初のサインアップを実行
      await SELF.fetch("http://localhost:8787/signup", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          userName: "testuser",
        }),
      });

      // 同じメールアドレスで再度サインアップを試みる
      const response = await SELF.fetch("http://localhost:8787/signup", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          userName: "testuser",
        }),
      });

      expect(response.status).toBe(409);
    });

    it("必須フィールド(password)が欠けている場合、サインアップできない", async () => {
      const response = await SELF.fetch("http://localhost:8787/signup", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          // passwordが欠けている
          userName: "testuser",
        }),
      });

      expect(response.status).toBe(400);
    });
  });
});
