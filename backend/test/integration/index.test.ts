// test/integration.spec.js (または .ts)
import { SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { excuteMigrations } from "../lib";

describe("Worker Integration Test", () => {
  // 2. beforeAll でマイグレーションを実行
  beforeAll(async () => {
    await excuteMigrations();
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
