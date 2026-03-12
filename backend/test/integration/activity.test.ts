import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

/**
 * ヘルパー関数: テスト用ユーザーをサインアップし、サインインしてJWTトークンを取得する
 */
const getAuthToken = async (
  email: string,
  password = "password123",
  userName = "activityTestUser",
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
/**
 * ヘルパー関数: テスト用ロードマップを作成し、タスクIDを返す
 */
const createTestRoadmapAndGetTaskId = async (
  token: string,
): Promise<string> => {
  const saveResponse = await SELF.fetch("http://localhost:8787/api/roadmap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentState: "活動記録テスト用",
      goalState: "活動記録テスト目標",
      pdfContext: null,
      summary: "テスト用ロードマップ",
      milestones: [
        {
          title: "テストマイルストーン",
          description: "テスト",
          orderIndex: 0,
          tasks: [
            {
              title: "テストタスク",
              estimatedHours: 10,
              orderIndex: 0,
            },
          ],
        },
      ],
    }),
  });
  const saveBody: {
    roadmapId: string;
  } = await saveResponse.json();
  // ロードマップ詳細からタスクIDを取得
  const detailResponse = await SELF.fetch(
    `http://localhost:8787/api/roadmap/${saveBody.roadmapId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const detailBody: {
    roadmap: {
      milestones: Array<{
        tasks: Array<{
          id: string;
        }>;
      }>;
    };
  } = await detailResponse.json();
  return detailBody.roadmap.milestones[0].tasks[0].id;
};
describe("Activity Tracking API Integration Test", () => {
  describe("活動記録の作成 (POST /api/activities)", () => {
    it("正常に活動記録を作成できる", async () => {
      const token = await getAuthToken("activity-create@example.com");
      const taskId = await createTestRoadmapAndGetTaskId(token);
      const response = await SELF.fetch(
        "http://localhost:8787/api/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            taskId,
            content: "## 今日の学び\n\nReact Hooksを復習した。",
            loggedDate: "2026-03-03",
          }),
        },
      );
      expect(response.status).toBe(201);
      const body: {
        activityLogId: string;
      } = await response.json();
      expect(body.activityLogId).toBeDefined();
      expect(typeof body.activityLogId).toBe("string");
    });
    it("バリデーションエラー時は400が返る（content空文字）", async () => {
      const token = await getAuthToken("activity-validation@example.com");
      const taskId = await createTestRoadmapAndGetTaskId(token);
      const response = await SELF.fetch(
        "http://localhost:8787/api/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            taskId,
            content: "",
            loggedDate: "2026-03-03",
          }),
        },
      );
      expect(response.status).toBe(400);
    });
  });
  describe("活動記録一覧取得 (GET /api/activities/:taskId)", () => {
    it("タスクに紐づく活動記録を日時降順で取得できる", async () => {
      const token = await getAuthToken("activity-list@example.com");
      const taskId = await createTestRoadmapAndGetTaskId(token);
      // 2件の記録を異なる日付で作成
      await SELF.fetch("http://localhost:8787/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId,
          content: "1日目の学び",
          loggedDate: "2026-03-01",
        }),
      });
      await SELF.fetch("http://localhost:8787/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId,
          content: "2日目の学び",
          loggedDate: "2026-03-02",
        }),
      });
      const response = await SELF.fetch(
        `http://localhost:8787/api/activities/${taskId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(response.status).toBe(200);
      const body: {
        activityLogs: Array<{
          content: string;
          loggedDate: string;
        }>;
      } = await response.json();
      expect(body.activityLogs).toHaveLength(2);
      // 日時降順で最新が先
      expect(body.activityLogs[0].loggedDate).toBe("2026-03-02");
      expect(body.activityLogs[1].loggedDate).toBe("2026-03-01");
    });
  });
  describe("活動記録の更新 (PUT /api/activities/:activityId)", () => {
    it("活動記録を正常に更新できる", async () => {
      const token = await getAuthToken("activity-update@example.com");
      const taskId = await createTestRoadmapAndGetTaskId(token);
      // 記録作成
      const createResponse = await SELF.fetch(
        "http://localhost:8787/api/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            taskId,
            content: "更新前の内容",
            loggedDate: "2026-03-03",
          }),
        },
      );
      const createBody: {
        activityLogId: string;
      } = await createResponse.json();
      // 更新
      const updateResponse = await SELF.fetch(
        `http://localhost:8787/api/activities/${createBody.activityLogId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: "更新後の内容",
          }),
        },
      );
      expect(updateResponse.status).toBe(200);
      // 更新反映確認
      const listResponse = await SELF.fetch(
        `http://localhost:8787/api/activities/${taskId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const listBody: {
        activityLogs: Array<{
          content: string;
        }>;
      } = await listResponse.json();
      expect(listBody.activityLogs[0].content).toBe("更新後の内容");
    });
  });
  describe("活動記録の削除 (DELETE /api/activities/:activityId)", () => {
    it("活動記録を正常に削除できる", async () => {
      const token = await getAuthToken("activity-delete@example.com");
      const taskId = await createTestRoadmapAndGetTaskId(token);
      // 記録作成
      const createResponse = await SELF.fetch(
        "http://localhost:8787/api/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            taskId,
            content: "削除テスト用",
            loggedDate: "2026-03-03",
          }),
        },
      );
      const createBody: {
        activityLogId: string;
      } = await createResponse.json();
      // 削除
      const deleteResponse = await SELF.fetch(
        `http://localhost:8787/api/activities/${createBody.activityLogId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(deleteResponse.status).toBe(200);
      // 削除後に一覧取得すると0件
      const listResponse = await SELF.fetch(
        `http://localhost:8787/api/activities/${taskId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const listBody: {
        activityLogs: Array<unknown>;
      } = await listResponse.json();
      expect(listBody.activityLogs).toHaveLength(0);
    });
  });
  describe("所有者チェック", () => {
    it("他のユーザーの活動記録は更新できない（403）", async () => {
      const tokenA = await getAuthToken("activity-owner-a@example.com");
      const tokenB = await getAuthToken("activity-owner-b@example.com");
      const taskId = await createTestRoadmapAndGetTaskId(tokenA);
      // ユーザーAで記録作成
      const createResponse = await SELF.fetch(
        "http://localhost:8787/api/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({
            taskId,
            content: "ユーザーAの記録",
            loggedDate: "2026-03-03",
          }),
        },
      );
      const createBody: {
        activityLogId: string;
      } = await createResponse.json();
      // ユーザーBで更新しようとすると403
      const updateResponse = await SELF.fetch(
        `http://localhost:8787/api/activities/${createBody.activityLogId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenB}`,
          },
          body: JSON.stringify({
            content: "不正な更新",
          }),
        },
      );
      expect(updateResponse.status).toBe(403);
    });
  });
  describe("タスクステータス更新 (PATCH /api/tasks/:taskId/status)", () => {
    it("タスクのステータスを正常に更新できる", async () => {
      const token = await getAuthToken("task-status@example.com");
      const taskId = await createTestRoadmapAndGetTaskId(token);
      const response = await SELF.fetch(
        `http://localhost:8787/api/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "IN_PROGRESS",
          }),
        },
      );
      expect(response.status).toBe(200);
    });
  });
});
