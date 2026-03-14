import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as portfolioApi from "@/features/portfolio/api/portfolioApi";
import { usePublicPortfolio } from "@/features/portfolio/hooks/usePublicPortfolio";

vi.mock("@/features/portfolio/api/portfolioApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/portfolio/api/portfolioApi")
  >("@/features/portfolio/api/portfolioApi");
  return {
    ...actual,
    fetchPublicPortfolio: vi.fn(),
  };
});

describe("usePublicPortfolio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("公開ポートフォリオを取得できる", async () => {
    vi.mocked(portfolioApi.fetchPublicPortfolio).mockResolvedValue({
      slug: "riku",
      settings: {
        profile: {
          displayName: "riku",
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
          careerStories: [],
          skills: [],
        },
        generation: {
          selectedSummaryIds: [],
          selfPrDraft: "",
        },
        generatedContent: {
          selfPr: "",
          strengths: "",
          learnings: "",
          futureVision: "",
        },
      },
    });

    const { result } = renderHook(() => usePublicPortfolio("riku"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.portfolioData?.slug).toBe("riku");
    expect(result.current.error).toBeNull();
  });

  it("APIエラー時にerrorを設定する", async () => {
    vi.mocked(portfolioApi.fetchPublicPortfolio).mockRejectedValue(
      new portfolioApi.PortfolioApiError("not found", 404),
    );

    const { result } = renderHook(() => usePublicPortfolio("missing"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("not found");
  });
});
