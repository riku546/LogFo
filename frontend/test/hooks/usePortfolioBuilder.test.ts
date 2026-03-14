import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as portfolioApi from "@/features/portfolio/api/portfolioApi";
import { usePortfolioBuilder } from "@/features/portfolio/hooks/usePortfolioBuilder";

const { pushMock, toastErrorMock, toastSuccessMock, routerMock } = vi.hoisted(
  () => {
    const push = vi.fn();
    return {
      pushMock: push,
      toastErrorMock: vi.fn(),
      toastSuccessMock: vi.fn(),
      routerMock: { push },
    };
  },
);

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

vi.mock("@/features/portfolio/api/portfolioApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/portfolio/api/portfolioApi")
  >("@/features/portfolio/api/portfolioApi");
  return {
    ...actual,
    fetchMyPortfolio: vi.fn(),
    savePortfolio: vi.fn(),
  };
});

describe("usePortfolioBuilder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("既存ポートフォリオを読み込み、欠損項目を補完する", async () => {
    localStorage.setItem("token", "token-1");
    vi.mocked(portfolioApi.fetchMyPortfolio).mockResolvedValue({
      id: "portfolio-1",
      userId: "user-1",
      slug: "riku",
      isPublic: true,
      settings: {
        profile: {
          displayName: "riku",
          careerStories: [],
          skills: [],
        },
        generation: {
          selectedSummaryIds: ["summary-1"],
          selfPrDraft: "",
        },
        generatedContent: {
          selfPr: "",
          strengths: "",
          learnings: "",
          futureVision: "",
        },
      } as never,
      createdAt: "2026-03-12",
      updatedAt: "2026-03-12",
    });

    const { result } = renderHook(() => usePortfolioBuilder());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.slug).toBe("riku");
    expect(result.current.settings.profile.socialLinks).toBeDefined();
  });

  it("保存時にslug重複(409)を表示する", async () => {
    localStorage.setItem("token", "token-1");
    vi.mocked(portfolioApi.fetchMyPortfolio).mockResolvedValue(null);
    vi.mocked(portfolioApi.savePortfolio).mockRejectedValue(
      new portfolioApi.PortfolioApiError("conflict", 409),
    );

    const { result } = renderHook(() => usePortfolioBuilder());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSlug("riku");
      result.current.updateProfile({ displayName: "Riku" });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(portfolioApi.savePortfolio).toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "このスラッグは既に使用されています",
    );
  });

  it("未ログイン時はsigninへ遷移する", async () => {
    const { result } = renderHook(() => usePortfolioBuilder());

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/signin");
    });

    await act(async () => {
      await result.current.handleSave();
    });
    expect(portfolioApi.savePortfolio).not.toHaveBeenCalled();
  });
});
