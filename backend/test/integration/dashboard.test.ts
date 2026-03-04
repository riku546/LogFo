import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

/**
 * ヘルパー関数: テスト用ユーザーをサインアップし、サインインしてJWTトークンを取得する
 */
const getAuthToken = async (
  email: string,
  password = "password123",
  userName = "dashboardTestUser",
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

describe("統計情報取得 (GET /api/dashboard/stats)", () => {
  it("ダッシュボード用のグラフ・統計データが取得できる", async () => {
    const token = await getAuthToken("dashboard-stats@example.com");

    await SELF.fetch("http://localhost:8787/api/dashboard/sync/github", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const response = await SELF.fetch(
      "http://localhost:8787/api/dashboard/stats",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      stats: {
        totalActivities: number;
        providerDistribution: Record<string, number>;
      };
    };

    expect(body.stats).toBeDefined();
    expect(body.stats.totalActivities).toBeGreaterThanOrEqual(0);
    expect(body.stats.providerDistribution).toBeDefined();
  });
});
