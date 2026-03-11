import { describe, expect, it, vi } from "vitest";
import {
  type SavePortfolioPayload,
  savePortfolio,
} from "@/features/portfolio/api/portfolioApi";

const createPayload = (): SavePortfolioPayload => ({
  slug: "test-slug",
  isPublic: false,
  settings: {
    profile: {
      displayName: "テストユーザー",
      bio: "",
      avatarUrl: "",
      socialLinks: {
        github: "",
        x: "",
        zenn: "",
        qiita: "",
        atcoder: "",
        website: "",
      },
      careerStories: [
        {
          id: "career-1",
          title: "Frontend Engineer",
          organization: "LogFo",
          periodFrom: "2024-04",
          periodTo: "",
          isCurrent: true,
          story: "UI改善を担当",
        },
      ],
      skills: ["React", "TypeScript"],
    },
    sections: {
      roadmapIds: [],
      summaryIds: [],
    },
  },
});

describe("portfolioApi.savePortfolio", () => {
  it("careerStoriesとskillsをPOST payloadへ含める", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ portfolioId: "portfolio-id" }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    const payload = createPayload();
    await savePortfolio("test-token", payload);

    const fetchMock = vi.mocked(fetch);
    const call = fetchMock.mock.calls[0];
    const requestBody = JSON.parse(call?.[1]?.body as string) as {
      settings: {
        profile: {
          careerStories: Array<{ id: string; title: string }>;
          skills: string[];
        };
      };
    };

    expect(requestBody.settings.profile.careerStories[0]).toMatchObject({
      id: "career-1",
      title: "Frontend Engineer",
    });
    expect(requestBody.settings.profile.skills).toEqual([
      "React",
      "TypeScript",
    ]);
  });
});
