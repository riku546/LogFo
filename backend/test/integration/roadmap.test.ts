import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

/**
 * ヘルパー関数: テスト用ユーザーをサインアップし、サインインしてJWTトークンを取得する
 */
const getAuthToken = async (
  email = "roadmap-test@example.com",
  password = "password123",
  userName = "roadmapTestUser",
): Promise<string> => {
  // サインアップ
  await SELF.fetch("http://localhost:8787/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, userName }),
  });
  // サインイン
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
describe("Roadmap API Integration Test", () => {
  describe("認証なしのアクセス", () => {
    it("JWT無しでロードマップ一覧を取得しようとすると401が返る", async () => {
      const response = await SELF.fetch("http://localhost:8787/api/roadmap", {
        method: "GET",
      });
      expect(response.status).toBe(401);
    });
    it("JWT無しでロードマップを保存しようとすると401が返る", async () => {
      const response = await SELF.fetch("http://localhost:8787/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentState: "テスト",
          goalState: "テスト目標",
          summary: "テストサマリー",
          milestones: [],
        }),
      });
      expect(response.status).toBe(401);
    });
  });
  describe("ロードマップ保存 (POST /api/roadmap)", () => {
    it("正常にロードマップを保存できる", async () => {
      const token = await getAuthToken(
        "save-test@example.com",
        "password123",
        "saveTestUser",
      );
      const response = await SELF.fetch("http://localhost:8787/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentState: "大学3年生 | スキル: JavaScript, React",
          goalState: "Webフロントエンドエンジニア",
          pdfContext: null,
          summary: "React/Next.jsを中心とした学習ロードマップ",
          milestones: [
            {
              title: "基礎固め",
              description: "JavaScript/TypeScriptの基礎を固める",
              orderIndex: 0,
              tasks: [
                {
                  title: "TypeScriptの型システムを学ぶ",
                  estimatedHours: 20,
                  orderIndex: 0,
                },
                {
                  title: "React Hooksの基本を復習",
                  estimatedHours: 10,
                  orderIndex: 1,
                },
              ],
            },
            {
              title: "実践",
              description: "ポートフォリオサイトを作成する",
              orderIndex: 1,
              tasks: [
                {
                  title: "Next.jsでブログサイトを構築",
                  estimatedHours: 30,
                  orderIndex: 0,
                },
              ],
            },
          ],
        }),
      });
      expect(response.status).toBe(201);
      const body: {
        roadmapId: string;
      } = await response.json();
      expect(body.roadmapId).toBeDefined();
      expect(typeof body.roadmapId).toBe("string");
    });
    it("バリデーションエラー時は400が返る（必須フィールド欠損）", async () => {
      const token = await getAuthToken(
        "save-validation@example.com",
        "password123",
        "validationUser",
      );
      const response = await SELF.fetch("http://localhost:8787/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // currentStateが欠けている
          goalState: "テスト",
          milestones: [],
        }),
      });
      expect(response.status).toBe(400);
    });
  });
  describe("ロードマップ一覧取得 (GET /api/roadmap)", () => {
    it("認証済みユーザーのロードマップ一覧を取得できる", async () => {
      const token = await getAuthToken(
        "list-test@example.com",
        "password123",
        "listTestUser",
      );
      // まずロードマップを1件保存
      await SELF.fetch("http://localhost:8787/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentState: "学生",
          goalState: "エンジニア",
          pdfContext: null,
          summary: "テスト一覧用サマリー",
          milestones: [
            {
              title: "Step 1",
              description: "最初のステップ",
              orderIndex: 0,
              tasks: [],
            },
          ],
        }),
      });
      // 一覧取得
      const response = await SELF.fetch("http://localhost:8787/api/roadmap", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.status).toBe(200);
      const body: {
        roadmaps: Array<{
          id: string;
          goalState: string;
          currentState: string;
          createdAt: string;
        }>;
      } = await response.json();
      expect(body.roadmaps).toBeDefined();
      expect(Array.isArray(body.roadmaps)).toBe(true);
      expect(body.roadmaps.length).toBeGreaterThanOrEqual(1);
      expect(body.roadmaps[0].createdAt).toBeTruthy();
      expect(body.roadmaps[0].createdAt).not.toBe("1970-01-01T00:00:00.000Z");
    });
  });
  describe("ロードマップ詳細取得 (GET /api/roadmap/:id)", () => {
    it("保存したロードマップの詳細を取得できる", async () => {
      const token = await getAuthToken(
        "detail-test@example.com",
        "password123",
        "detailTestUser",
      );
      // ロードマップ保存
      const saveResponse = await SELF.fetch(
        "http://localhost:8787/api/roadmap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentState: "初心者",
            goalState: "フルスタックエンジニア",
            pdfContext: null,
            summary: "フルスタック学習計画",
            milestones: [
              {
                title: "フロントエンド",
                description: "React/Next.jsの習得",
                orderIndex: 0,
                tasks: [
                  {
                    title: "Reactの基礎",
                    estimatedHours: 15,
                    orderIndex: 0,
                  },
                ],
              },
            ],
          }),
        },
      );
      const saveBody: {
        roadmapId: string;
      } = await saveResponse.json();
      const roadmapId = saveBody.roadmapId;
      // 詳細取得
      const response = await SELF.fetch(
        `http://localhost:8787/api/roadmap/${roadmapId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(response.status).toBe(200);
      const body: {
        roadmap: {
          id: string;
          currentState: string;
          goalState: string;
          summary: string;
          createdAt: string;
          milestones: Array<{
            title: string;
            createdAt: string;
            tasks: Array<{
              title: string;
              estimatedHours: number;
              createdAt: string;
            }>;
          }>;
        };
      } = await response.json();
      expect(body.roadmap).toBeDefined();
      expect(body.roadmap.id).toBe(roadmapId);
      expect(body.roadmap.goalState).toBe("フルスタックエンジニア");
      expect(body.roadmap.createdAt).toBeTruthy();
      expect(body.roadmap.milestones).toHaveLength(1);
      expect(body.roadmap.milestones[0].title).toBe("フロントエンド");
      expect(body.roadmap.milestones[0].createdAt).toBeTruthy();
      expect(body.roadmap.milestones[0].tasks).toHaveLength(1);
      expect(body.roadmap.milestones[0].tasks[0].createdAt).toBeTruthy();
    });
    it("存在しないIDの場合は404が返る", async () => {
      const token = await getAuthToken(
        "notfound-test@example.com",
        "password123",
        "notFoundUser",
      );
      const response = await SELF.fetch(
        "http://localhost:8787/api/roadmap/non-existent-id",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(response.status).toBe(404);
    });
  });
  describe("ロードマップ更新 (PUT /api/roadmap/:id)", () => {
    it("ロードマップを正常に更新できる", async () => {
      const token = await getAuthToken(
        "update-test@example.com",
        "password123",
        "updateTestUser",
      );
      // まず保存
      const saveResponse = await SELF.fetch(
        "http://localhost:8787/api/roadmap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentState: "初心者",
            goalState: "バックエンドエンジニア",
            pdfContext: null,
            summary: "バックエンド学習計画",
            milestones: [
              {
                title: "Node.js基礎",
                description: "Node.jsの基本を学ぶ",
                orderIndex: 0,
                tasks: [
                  {
                    title: "Express入門",
                    estimatedHours: 10,
                    orderIndex: 0,
                  },
                ],
              },
            ],
          }),
        },
      );
      const saveBody: {
        roadmapId: string;
      } = await saveResponse.json();
      const roadmapId = saveBody.roadmapId;
      // 更新
      const updateResponse = await SELF.fetch(
        `http://localhost:8787/api/roadmap/${roadmapId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentState: "初心者",
            goalState: "バックエンドエンジニア（更新済み）",
            pdfContext: null,
            summary: "更新されたバックエンド学習計画",
            milestones: [
              {
                title: "Node.js基礎（更新）",
                description: "Node.jsの基本を学ぶ（内容更新）",
                status: "IN_PROGRESS",
                orderIndex: 0,
                tasks: [
                  {
                    title: "Express入門（完了）",
                    estimatedHours: 10,
                    status: "DONE",
                    orderIndex: 0,
                  },
                  {
                    title: "Hono入門",
                    estimatedHours: 8,
                    status: "TODO",
                    orderIndex: 1,
                  },
                ],
              },
            ],
          }),
        },
      );
      expect(updateResponse.status).toBe(200);
      // 更新後のデータを確認
      const detailResponse = await SELF.fetch(
        `http://localhost:8787/api/roadmap/${roadmapId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const detailBody: {
        roadmap: {
          goalState: string;
          summary: string;
          milestones: Array<{
            title: string;
            tasks: Array<{
              title: string;
              status: string;
            }>;
          }>;
        };
      } = await detailResponse.json();
      expect(detailBody.roadmap.goalState).toBe(
        "バックエンドエンジニア（更新済み）",
      );
      expect(detailBody.roadmap.summary).toBe("更新されたバックエンド学習計画");
      expect(detailBody.roadmap.milestones[0].tasks).toHaveLength(2);
    });
  });
  describe("ロードマップ削除 (DELETE /api/roadmap/:id)", () => {
    it("ロードマップを正常に削除できる", async () => {
      const token = await getAuthToken(
        "delete-test@example.com",
        "password123",
        "deleteTestUser",
      );
      // まず保存
      const saveResponse = await SELF.fetch(
        "http://localhost:8787/api/roadmap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentState: "テスト",
            goalState: "削除テスト",
            pdfContext: null,
            summary: "削除テスト用",
            milestones: [],
          }),
        },
      );
      const saveBody: {
        roadmapId: string;
      } = await saveResponse.json();
      const roadmapId = saveBody.roadmapId;
      // 削除
      const deleteResponse = await SELF.fetch(
        `http://localhost:8787/api/roadmap/${roadmapId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(deleteResponse.status).toBe(200);
      // 削除後にアクセスすると404が返る
      const detailResponse = await SELF.fetch(
        `http://localhost:8787/api/roadmap/${roadmapId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(detailResponse.status).toBe(404);
    });
  });
  describe("所有者チェック", () => {
    it("他のユーザーのロードマップにはアクセスできない（403）", async () => {
      // ユーザーA
      const tokenA = await getAuthToken(
        "owner-a@example.com",
        "password123",
        "ownerA",
      );
      // ユーザーB
      const tokenB = await getAuthToken(
        "owner-b@example.com",
        "password123",
        "ownerB",
      );
      // ユーザーAでロードマップ保存
      const saveResponse = await SELF.fetch(
        "http://localhost:8787/api/roadmap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({
            currentState: "ユーザーAの状態",
            goalState: "ユーザーAの目標",
            pdfContext: null,
            summary: "ユーザーAのロードマップ",
            milestones: [],
          }),
        },
      );
      const saveBody: {
        roadmapId: string;
      } = await saveResponse.json();
      const roadmapId = saveBody.roadmapId;
      // ユーザーBでアクセスしようとすると403
      const accessResponse = await SELF.fetch(
        `http://localhost:8787/api/roadmap/${roadmapId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${tokenB}` },
        },
      );
      expect(accessResponse.status).toBe(403);
    });
  });
});
