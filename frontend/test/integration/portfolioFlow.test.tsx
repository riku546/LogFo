import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PortfolioBuilderPage from "@/app/(app)/portfolio/page";
import * as portfolioApi from "@/features/portfolio/api/portfolioApi";
import * as roadmapApi from "@/features/roadmap/api/roadmapApi";
import * as summaryApi from "@/features/summary/api/summaryApi";

const { routerMock } = vi.hoisted(() => ({
  routerMock: { push: vi.fn() },
}));

vi.mock("@/features/portfolio/components/ConfigSidebar", () => ({
  ConfigSidebar: ({
    onUpdateProfile,
  }: {
    onUpdateProfile: (value: { displayName: string }) => void;
  }) => (
    <button
      type="button"
      onClick={() => onUpdateProfile({ displayName: "Riku" })}
    >
      プロフィール更新
    </button>
  ),
}));

vi.mock("@/features/portfolio/components/LivePreviewPane", () => ({
  LivePreviewPane: () => <div data-testid="preview" />,
}));

vi.mock("@/features/portfolio/components/PublishSettingsPanel", () => ({
  PublishSettingsPanel: ({
    onSave,
    onOpenPublishSettings,
  }: {
    onSave: () => void;
    onOpenPublishSettings: () => void;
  }) => (
    <div>
      <button type="button" onClick={onSave}>
        保存
      </button>
      <button type="button" onClick={onOpenPublishSettings}>
        公開設定
      </button>
    </div>
  ),
}));

vi.mock("@/features/portfolio/components/PublishSettingsModal", () => ({
  PublishSettingsModal: ({
    isOpen,
    onSlugChange,
  }: {
    isOpen: boolean;
    onSlugChange: (slug: string) => void;
  }) =>
    isOpen ? (
      <div data-testid="publish-modal">
        <button type="button" onClick={() => onSlugChange("riku")}>
          slug設定
        </button>
      </div>
    ) : null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
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

vi.mock("@/features/roadmap/api/roadmapApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/roadmap/api/roadmapApi")
  >("@/features/roadmap/api/roadmapApi");
  return {
    ...actual,
    fetchRoadmapList: vi.fn(),
    fetchRoadmapDetail: vi.fn(),
  };
});

vi.mock("@/features/summary/api/summaryApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/summary/api/summaryApi")
  >("@/features/summary/api/summaryApi");
  return {
    ...actual,
    fetchSummariesByMilestone: vi.fn(),
  };
});

describe("Portfolio integration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");

    vi.mocked(portfolioApi.fetchMyPortfolio).mockResolvedValue(null);
    vi.mocked(portfolioApi.savePortfolio).mockResolvedValue("portfolio-1");
    vi.mocked(roadmapApi.fetchRoadmapList).mockResolvedValue([
      {
        id: "roadmap-1",
        currentState: "current",
        goalState: "goal",
        summary: null,
        createdAt: "2026-03-12",
        updatedAt: "2026-03-12",
      },
    ]);
    vi.mocked(roadmapApi.fetchRoadmapDetail).mockResolvedValue({
      id: "roadmap-1",
      userId: "user-1",
      currentState: "current",
      goalState: "goal",
      pdfContext: null,
      summary: null,
      createdAt: "2026-03-12",
      updatedAt: "2026-03-12",
      milestones: [],
    });
    vi.mocked(summaryApi.fetchSummariesByMilestone).mockResolvedValue([]);
  });

  it("編集して保存し、公開設定モーダルを開ける", async () => {
    render(<PortfolioBuilderPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "プロフィール更新" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "プロフィール更新" }));
    fireEvent.click(screen.getByRole("button", { name: "公開設定" }));
    fireEvent.click(screen.getByRole("button", { name: "slug設定" }));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(portfolioApi.savePortfolio).toHaveBeenCalled();
    });

    expect(screen.getByTestId("publish-modal")).toBeInTheDocument();
  });
});
