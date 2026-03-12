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
  const signinBody: {
    token: string;
  } = await signinResponse.json();
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
    const body: {
      stats: {
        totalActivities: number;
        providerDistribution: Record<string, number>;
      };
    } = await response.json();
    expect(body.stats).toBeDefined();
    expect(body.stats.totalActivities).toBeGreaterThanOrEqual(0);
    expect(body.stats.providerDistribution).toBeDefined();
  });
});
describe("ダッシュボードデータ取得 (GET /api/dashboard/provider-widgets)", () => {
  it("指定期間のプロバイダー別ウィジェット情報が取得できる", async () => {
    const token = await getAuthToken("dashboard-widgets@example.com");
    const response = await SELF.fetch(
      "http://localhost:8787/api/dashboard/provider-widgets",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    expect(response.status).toBe(200);
    const body: {
      widgetsData: Record<
        string,
        {
          last10Days: {
            date: string;
            count: number;
          }[];
          batteryLevel: number;
        }
      >;
    } = await response.json();
    expect(body).toHaveProperty("widgetsData");
  });
});
