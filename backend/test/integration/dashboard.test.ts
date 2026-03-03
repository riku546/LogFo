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

describe("Dashboard & Integration API Integration Test", () => {
  describe("手動同期機能 (POST /api/dashboard/sync/:provider)", () => {
    it("モックデータを利用してGithubの同期処理が正常終了する", async () => {
      const token = await getAuthToken("dashboard-sync@example.com");

      const response = await SELF.fetch(
        "http://localhost:8787/api/dashboard/sync/github",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as { message: string, syncedItemsCount: number };
      expect(body.message).toBe("Successfully synced github data");
      expect(body.syncedItemsCount).toBeGreaterThanOrEqual(1); // モックで何らか保存される想定
    });

    it("サポートされていないプロバイダの場合は400エラーとなる", async () => {
      const token = await getAuthToken("dashboard-sync-err@example.com");

      const response = await SELF.fetch(
        "http://localhost:8787/api/dashboard/sync/unknown_provider",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      expect(response.status).toBe(400); // Validation Errorを期待
    });
  });

  describe("ダッシュボードデータ取得 (GET /api/dashboard/heatmap)", () => {
    it("同期後、ヒートマップ用の集計データが取得できる", async () => {
      const token = await getAuthToken("dashboard-heatmap@example.com");

      // 先に同期データを作成
      await SELF.fetch(
        "http://localhost:8787/api/dashboard/sync/github",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 手動ログも１つ作成 (taskIdが必要だが今回は簡略化、外部データ側のCountだけでも検証できるか確認)
      // 今回は外部同期分だけで配列が返るかをテスト

      const response = await SELF.fetch(
        "http://localhost:8787/api/dashboard/heatmap?startDate=2026-03-01&endDate=2026-03-31",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        heatmapData: Array<{
          date: string;
          totalCount: number;
        }>;
      };
      // githubモックデータが含まれているはず
      expect(body.heatmapData).toBeInstanceOf(Array);
      expect(body.heatmapData.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("統計情報取得 (GET /api/dashboard/stats)", () => {
    it("ダッシュボード用のグラフ・統計データが取得できる", async () => {
      const token = await getAuthToken("dashboard-stats@example.com");

      await SELF.fetch(
        "http://localhost:8787/api/dashboard/sync/github",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
});
