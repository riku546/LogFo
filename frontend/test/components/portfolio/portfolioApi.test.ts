import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
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
  const parseRequestBody = (value: string) => {
    const requestBodySchema = z.object({
      settings: z.object({
        profile: z.object({
          careerStories: z.array(
            z.object({ id: z.string(), title: z.string() }),
          ),
          skills: z.array(z.string()),
        }),
      }),
    });
    const parsed: unknown = JSON.parse(value);
    const validated = requestBodySchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error("invalid request body");
    }

    return validated.data;
  };

  const extractRequestBody = async (
    input: RequestInfo | URL | undefined,
    init: RequestInit | undefined,
  ): Promise<string> => {
    if (typeof init?.body === "string") {
      return init.body;
    }
    if (input instanceof Request) {
      return input.clone().text();
    }
    throw new Error("request body is not string");
  };

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
    const requestBodyRaw = await extractRequestBody(call?.[0], call?.[1]);
    const requestBody = parseRequestBody(requestBodyRaw);

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
