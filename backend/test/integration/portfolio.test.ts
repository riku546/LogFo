import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

/**
 * テスト用ユーザーをサインアップし、サインインしてJWTトークンを取得するヘルパー関数
 */
const getAuthToken = async (
  email: string,
  password = "password123",
  userName = "portfolioTestUser",
): Promise<string> => {
  await SELF.fetch("http://localhost:8787/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, userName }),
  });

  const signinResponse = await SELF.fetch("http://localhost:8787/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const signinBody = (await signinResponse.json()) as { token: string };
  return signinBody.token;
};

/**
 * テスト用のvalidなポートフォリオ設定を生成するヘルパー関数
 */
const createTestSettings = (overrides = {}) => ({
  profile: {
    displayName: "Test User",
    bio: "Test bio",
    avatarUrl: "",
    socialLinks: {
      github: "",
      x: "",
      website: "",
    },
  },
  sections: {
    roadmapIds: [],
    summaryIds: [],
  },
  ...overrides,
});

describe("Portfolio API Integration Test", () => {
  describe("portfolio save (POST /api/portfolio)", () => {
    it("save portfolio successfully (create)", async () => {
      const token = await getAuthToken("portfolio-save@example.com");

      const response = await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: "test-user",
          isPublic: false,
          settings: createTestSettings(),
        }),
      });

      expect(response.status).toBe(201);
      const body = (await response.json()) as { portfolioId: string };
      expect(body.portfolioId).toBeDefined();
      expect(typeof body.portfolioId).toBe("string");
    });

    it("update portfolio on second save (upsert)", async () => {
      const token = await getAuthToken("portfolio-upsert@example.com");

      // 1st save
      await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: "upsert-first",
          isPublic: false,
          settings: createTestSettings(),
        }),
      });

      // 2nd save (update)
      const updateResponse = await SELF.fetch(
        "http://localhost:8787/api/portfolio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            slug: "upsert-updated",
            isPublic: true,
            settings: createTestSettings({
              profile: {
                displayName: "Updated User",
                bio: "Updated bio",
                avatarUrl: "",
                socialLinks: {},
              },
            }),
          }),
        },
      );

      expect(updateResponse.status).toBe(201);

      // verify update
      const getResponse = await SELF.fetch(
        "http://localhost:8787/api/portfolio",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const getBody = (await getResponse.json()) as {
        portfolio: { slug: string; isPublic: boolean };
      };
      expect(getBody.portfolio.slug).toBe("upsert-updated");
      expect(getBody.portfolio.isPublic).toBe(true);
    });

    it("return 400 on validation error (empty slug)", async () => {
      const token = await getAuthToken("portfolio-validate@example.com");

      const response = await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: "",
          isPublic: false,
          settings: createTestSettings(),
        }),
      });

      expect(response.status).toBe(400);
    });

    it("return 400 on validation error (invalid slug format)", async () => {
      const token = await getAuthToken("portfolio-validate2@example.com");

      const response = await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: "INVALID_SLUG!",
          isPublic: false,
          settings: createTestSettings(),
        }),
      });

      expect(response.status).toBe(400);
    });

    it("return 409 on slug conflict with another user", async () => {
      const tokenA = await getAuthToken("portfolio-slug-a@example.com");
      const tokenB = await getAuthToken("portfolio-slug-b@example.com");

      // User A saves with slug "taken-slug"
      await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
          slug: "taken-slug",
          isPublic: false,
          settings: createTestSettings(),
        }),
      });

      // User B tries to use the same slug
      const response = await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenB}`,
        },
        body: JSON.stringify({
          slug: "taken-slug",
          isPublic: false,
          settings: createTestSettings(),
        }),
      });

      expect(response.status).toBe(409);
    });
  });

  describe("portfolio get (GET /api/portfolio)", () => {
    it("get portfolio after saving", async () => {
      const token = await getAuthToken("portfolio-get@example.com");

      // Save first
      await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: "get-test",
          isPublic: false,
          settings: createTestSettings(),
        }),
      });

      const response = await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        portfolio: { slug: string; isPublic: boolean };
      };
      expect(body.portfolio.slug).toBe("get-test");
      expect(body.portfolio.isPublic).toBe(false);
    });

    it("return 404 when no portfolio exists", async () => {
      const token = await getAuthToken("portfolio-noexist@example.com");

      const response = await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(404);
    });
  });

  describe("public portfolio (GET /portfolio/public/:slug)", () => {
    it("get public portfolio by slug", async () => {
      const token = await getAuthToken("portfolio-public@example.com");

      await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: "public-test",
          isPublic: true,
          settings: createTestSettings(),
        }),
      });

      // Access public route (no auth needed)
      const response = await SELF.fetch(
        "http://localhost:8787/portfolio/public/public-test",
        { method: "GET" },
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        portfolio: { slug: string; settings: unknown };
      };
      expect(body.portfolio.slug).toBe("public-test");
      expect(body.portfolio.settings).toBeDefined();
    });

    it("return 403 when portfolio is not public", async () => {
      const token = await getAuthToken("portfolio-private@example.com");

      await SELF.fetch("http://localhost:8787/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: "private-test",
          isPublic: false,
          settings: createTestSettings(),
        }),
      });

      const response = await SELF.fetch(
        "http://localhost:8787/portfolio/public/private-test",
        { method: "GET" },
      );

      expect(response.status).toBe(403);
    });

    it("return 404 when slug does not exist", async () => {
      const response = await SELF.fetch(
        "http://localhost:8787/portfolio/public/nonexistent-slug",
        { method: "GET" },
      );

      expect(response.status).toBe(404);
    });
  });
});
