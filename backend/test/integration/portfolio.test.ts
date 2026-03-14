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
  const signinBody: {
    token: string;
  } = await signinResponse.json();
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
    careerStories: [
      {
        id: "career-1",
        title: "Frontend Engineer",
        organization: "LogFo",
        periodFrom: "2024-04",
        periodTo: "2025-12",
        isCurrent: false,
        story: "UI改善と設計を担当",
      },
    ],
    skills: ["React", "TypeScript"],
  },
  generation: {
    selectedSummaryIds: [],
    chatInput: "",
    targetSection: "selfPr",
  },
  generatedContent: {
    selfPr: "",
    strengths: "",
    learnings: "",
    futureVision: "",
  },
  ...overrides,
});

/**
 * テスト用サマリーを作成してIDを返す
 */
const createSummaryForUser = async (
  token: string,
  title: string,
): Promise<string> => {
  const roadmapResponse = await SELF.fetch(
    "http://localhost:8787/api/roadmap",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentState: "portfolio test current",
        goalState: "portfolio test goal",
        pdfContext: null,
        summary: "portfolio test roadmap summary",
        milestones: [
          {
            title: "portfolio test milestone",
            description: "portfolio test milestone description",
            orderIndex: 0,
            tasks: [
              {
                title: "portfolio test task",
                estimatedHours: 1,
                orderIndex: 0,
              },
            ],
          },
        ],
      }),
    },
  );
  const roadmapBody: {
    roadmapId: string;
  } = await roadmapResponse.json();

  const roadmapDetailResponse = await SELF.fetch(
    `http://localhost:8787/api/roadmap/${roadmapBody.roadmapId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const roadmapDetailBody: {
    roadmap: {
      milestones: Array<{ id: string }>;
    };
  } = await roadmapDetailResponse.json();
  const milestoneId = roadmapDetailBody.roadmap.milestones[0].id;

  const summaryResponse = await SELF.fetch(
    "http://localhost:8787/api/summary",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        milestoneId,
        title,
        content: `${title} content`,
      }),
    },
  );
  const summaryBody: {
    summaryId: string;
  } = await summaryResponse.json();

  return summaryBody.summaryId;
};
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
      const body: {
        portfolioId: string;
      } = await response.json();
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
      const getBody: {
        portfolio: {
          slug: string;
          isPublic: boolean;
        };
      } = await getResponse.json();
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
  describe("portfolio generate (POST /api/portfolio/generate)", () => {
    it("return 400 when chatInput is empty", async () => {
      const token = await getAuthToken(
        "portfolio-generate-validation@example.com",
      );

      const response = await SELF.fetch(
        "http://localhost:8787/api/portfolio/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatInput: "",
            targetSection: "selfPr",
            selectedSummaryIds: [],
            profile: createTestSettings().profile,
            currentContent: {
              selfPr: "",
              strengths: "",
              learnings: "",
              futureVision: "",
            },
          }),
        },
      );

      expect(response.status).toBe(400);
    });

    it("return 403 when includes summary not owned by user", async () => {
      const ownerToken = await getAuthToken(
        "portfolio-generate-owner@example.com",
      );
      const attackerToken = await getAuthToken(
        "portfolio-generate-attacker@example.com",
      );
      const otherSummaryId = await createSummaryForUser(
        ownerToken,
        "owner summary",
      );

      const response = await SELF.fetch(
        "http://localhost:8787/api/portfolio/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${attackerToken}`,
          },
          body: JSON.stringify({
            chatInput: "強みと将来をフォーマルに整えてください",
            targetSection: "strengths",
            selectedSummaryIds: [otherSummaryId],
            profile: createTestSettings().profile,
            currentContent: {
              selfPr: "",
              strengths: "",
              learnings: "",
              futureVision: "",
            },
          }),
        },
      );

      expect(response.status).toBe(403);
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
      const body: {
        portfolio: {
          slug: string;
          isPublic: boolean;
          settings: {
            profile: {
              careerStories: Array<{
                id: string;
                title: string;
              }>;
              skills: string[];
            };
          };
        };
      } = await response.json();
      expect(body.portfolio.slug).toBe("get-test");
      expect(body.portfolio.isPublic).toBe(false);
      expect(body.portfolio.settings.profile.careerStories).toHaveLength(1);
      expect(body.portfolio.settings.profile.careerStories[0].id).toBe(
        "career-1",
      );
      expect(body.portfolio.settings.profile.careerStories[0].title).toBe(
        "Frontend Engineer",
      );
      expect(body.portfolio.settings.profile.skills).toEqual([
        "React",
        "TypeScript",
      ]);
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
      const body: {
        portfolio: {
          slug: string;
          settings: {
            profile: {
              careerStories: Array<{
                id: string;
              }>;
              skills: string[];
            };
          };
        };
      } = await response.json();
      expect(body.portfolio.slug).toBe("public-test");
      expect(body.portfolio.settings).toBeDefined();
      expect(body.portfolio.settings.profile.careerStories[0].id).toBe(
        "career-1",
      );
      expect(body.portfolio.settings.profile.skills).toEqual([
        "React",
        "TypeScript",
      ]);
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
