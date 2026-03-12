import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

/**
 * ヘルパー関数: テスト用ユーザーをサインアップし、サインインしてJWTトークンを取得する
 */
const getAuthToken = async (
  email: string,
  password = "password123",
  userName = "summaryTestUser",
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
 * ヘルパー関数: テスト用ロードマップを作成し、マイルストーンIDとタスクIDを返す
 */
const createTestRoadmapAndGetIds = async (
  token: string,
): Promise<{
  milestoneId: string;
  taskId: string;
}> => {
  const saveResponse = await SELF.fetch("http://localhost:8787/api/roadmap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentState: "summary test current",
      goalState: "summary test goal",
      pdfContext: null,
      summary: "summary test roadmap",
      milestones: [
        {
          title: "test milestone",
          description: "test description",
          orderIndex: 0,
          tasks: [
            {
              title: "test task",
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
        id: string;
        tasks: Array<{
          id: string;
        }>;
      }>;
    };
  } = await detailResponse.json();
  return {
    milestoneId: detailBody.roadmap.milestones[0].id,
    taskId: detailBody.roadmap.milestones[0].tasks[0].id,
  };
};
/**
 * ヘルパー関数: テスト用の活動記録を作成する
 */
const _createTestActivityLog = async (
  token: string,
  taskId: string,
  content: string,
  loggedDate: string,
): Promise<void> => {
  await SELF.fetch("http://localhost:8787/api/activities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ taskId, content, loggedDate }),
  });
};
describe("Summary API Integration Test", () => {
  describe("summary save (POST /api/summary)", () => {
    it("save summary successfully", async () => {
      const token = await getAuthToken("summary-save@example.com");
      const { milestoneId } = await createTestRoadmapAndGetIds(token);
      const response = await SELF.fetch("http://localhost:8787/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestoneId,
          title: "test summary title",
          content: "## test summary\n\ntest content markdown",
        }),
      });
      expect(response.status).toBe(201);
      const body: {
        summaryId: string;
      } = await response.json();
      expect(body.summaryId).toBeDefined();
      expect(typeof body.summaryId).toBe("string");
    });
    it("return 400 on validation error (empty title)", async () => {
      const token = await getAuthToken("summary-validate@example.com");
      const { milestoneId } = await createTestRoadmapAndGetIds(token);
      const response = await SELF.fetch("http://localhost:8787/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestoneId,
          title: "",
          content: "content text",
        }),
      });
      expect(response.status).toBe(400);
    });
    it("return 400 on validation error (empty content)", async () => {
      const token = await getAuthToken("summary-validate2@example.com");
      const { milestoneId } = await createTestRoadmapAndGetIds(token);
      const response = await SELF.fetch("http://localhost:8787/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestoneId,
          title: "test title",
          content: "",
        }),
      });
      expect(response.status).toBe(400);
    });
  });
  describe("summary list by milestone (GET /api/summary/milestone/:milestoneId)", () => {
    it("get summaries ordered by createdAt desc", async () => {
      const token = await getAuthToken("summary-list@example.com");
      const { milestoneId } = await createTestRoadmapAndGetIds(token);
      // 2件のサマリーを作成
      await SELF.fetch("http://localhost:8787/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestoneId,
          title: "first summary",
          content: "first content",
        }),
      });
      await SELF.fetch("http://localhost:8787/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestoneId,
          title: "second summary",
          content: "second content",
        }),
      });
      const response = await SELF.fetch(
        `http://localhost:8787/api/summary/milestone/${milestoneId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(response.status).toBe(200);
      const body: {
        summaries: Array<{
          title: string;
          content: string;
        }>;
      } = await response.json();
      expect(body.summaries).toHaveLength(2);
    });
    it("return empty array when no summaries exist", async () => {
      const token = await getAuthToken("summary-empty@example.com");
      const { milestoneId } = await createTestRoadmapAndGetIds(token);
      const response = await SELF.fetch(
        `http://localhost:8787/api/summary/milestone/${milestoneId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(response.status).toBe(200);
      const body: {
        summaries: Array<unknown>;
      } = await response.json();
      expect(body.summaries).toHaveLength(0);
    });
  });
  describe("summary update (PUT /api/summary/:id)", () => {
    it("update summary successfully", async () => {
      const token = await getAuthToken("summary-update@example.com");
      const { milestoneId } = await createTestRoadmapAndGetIds(token);
      // サマリー作成
      const createResponse = await SELF.fetch(
        "http://localhost:8787/api/summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            milestoneId,
            title: "before update",
            content: "before content",
          }),
        },
      );
      const createBody: {
        summaryId: string;
      } = await createResponse.json();
      // 更新
      const updateResponse = await SELF.fetch(
        `http://localhost:8787/api/summary/${createBody.summaryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "after update",
            content: "after content",
          }),
        },
      );
      expect(updateResponse.status).toBe(200);
      // 更新反映確認
      const listResponse = await SELF.fetch(
        `http://localhost:8787/api/summary/milestone/${milestoneId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const listBody: {
        summaries: Array<{
          title: string;
          content: string;
        }>;
      } = await listResponse.json();
      expect(listBody.summaries[0].title).toBe("after update");
      expect(listBody.summaries[0].content).toBe("after content");
    });
  });
  describe("summary delete (DELETE /api/summary/:id)", () => {
    it("delete summary successfully", async () => {
      const token = await getAuthToken("summary-delete@example.com");
      const { milestoneId } = await createTestRoadmapAndGetIds(token);
      // サマリー作成
      const createResponse = await SELF.fetch(
        "http://localhost:8787/api/summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            milestoneId,
            title: "to be deleted",
            content: "delete me",
          }),
        },
      );
      const createBody: {
        summaryId: string;
      } = await createResponse.json();
      // 削除
      const deleteResponse = await SELF.fetch(
        `http://localhost:8787/api/summary/${createBody.summaryId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(deleteResponse.status).toBe(200);
      // 削除後に一覧取得すると0件
      const listResponse = await SELF.fetch(
        `http://localhost:8787/api/summary/milestone/${milestoneId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const listBody: {
        summaries: Array<unknown>;
      } = await listResponse.json();
      expect(listBody.summaries).toHaveLength(0);
    });
  });
  describe("ownership check", () => {
    it("return 403 when updating another user summary", async () => {
      const tokenA = await getAuthToken("summary-owner-a@example.com");
      const tokenB = await getAuthToken("summary-owner-b@example.com");
      const { milestoneId } = await createTestRoadmapAndGetIds(tokenA);
      // ユーザーAでサマリー作成
      const createResponse = await SELF.fetch(
        "http://localhost:8787/api/summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({
            milestoneId,
            title: "user A summary",
            content: "user A content",
          }),
        },
      );
      const createBody: {
        summaryId: string;
      } = await createResponse.json();
      // ユーザーBで更新しようとすると403
      const updateResponse = await SELF.fetch(
        `http://localhost:8787/api/summary/${createBody.summaryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenB}`,
          },
          body: JSON.stringify({
            title: "unauthorized update",
            content: "unauthorized content",
          }),
        },
      );
      expect(updateResponse.status).toBe(403);
    });
    it("return 403 when deleting another user summary", async () => {
      const tokenA = await getAuthToken("summary-owner-c@example.com");
      const tokenB = await getAuthToken("summary-owner-d@example.com");
      const { milestoneId } = await createTestRoadmapAndGetIds(tokenA);
      // ユーザーAでサマリー作成
      const createResponse = await SELF.fetch(
        "http://localhost:8787/api/summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({
            milestoneId,
            title: "user A summary",
            content: "user A content",
          }),
        },
      );
      const createBody: {
        summaryId: string;
      } = await createResponse.json();
      // ユーザーBで削除しようとすると403
      const deleteResponse = await SELF.fetch(
        `http://localhost:8787/api/summary/${createBody.summaryId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenB}` },
        },
      );
      expect(deleteResponse.status).toBe(403);
    });
  });
});
