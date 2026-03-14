import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PortfolioBuilderPage from "@/app/(app)/portfolio/page";
import * as portfolioApi from "@/features/portfolio/api/portfolioApi";
import * as summaryApi from "@/features/summary/api/summaryApi";

const { routerMock } = vi.hoisted(() => ({
  routerMock: { push: vi.fn() },
}));

vi.mock("@/features/portfolio/components/ConfigSidebar", () => ({
  ConfigSidebar: ({
    onUpdateGeneration,
    onSendMessage,
  }: {
    onUpdateGeneration: (value: { chatInput: string }) => void;
    onSendMessage: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onUpdateGeneration({ chatInput: "生成してください" })}
      >
        チャット入力
      </button>
      <button type="button" onClick={() => onSendMessage()}>
        生成
      </button>
    </div>
  ),
}));

vi.mock("@/features/portfolio/components/LivePreviewPane", () => ({
  LivePreviewPane: ({
    onUpdateProfile,
  }: {
    onUpdateProfile: (value: { displayName: string }) => void;
  }) => (
    <div data-testid="preview">
      <button
        type="button"
        onClick={() => onUpdateProfile({ displayName: "Riku" })}
      >
        プロフィール更新
      </button>
    </div>
  ),
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
    generatePortfolioContentStream: vi.fn(),
  };
});

vi.mock("@/features/summary/api/summaryApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/summary/api/summaryApi")
  >("@/features/summary/api/summaryApi");
  return {
    ...actual,
    fetchMySummaries: vi.fn(),
  };
});

describe("Portfolio integration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");

    vi.mocked(portfolioApi.fetchMyPortfolio).mockResolvedValue(null);
    vi.mocked(portfolioApi.savePortfolio).mockResolvedValue("portfolio-1");
    vi.mocked(portfolioApi.generatePortfolioContentStream).mockImplementation(
      async (_token, _payload, handlers) => {
        handlers.onDelta("generated self pr");
        handlers.onComplete("generated self pr");
      },
    );
    vi.mocked(summaryApi.fetchMySummaries).mockResolvedValue([]);
  });

  it("編集・生成・保存し、公開設定モーダルを開ける", async () => {
    render(<PortfolioBuilderPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "チャット入力" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "チャット入力" }));
    fireEvent.click(screen.getByRole("button", { name: "プロフィール更新" }));
    fireEvent.click(screen.getByRole("button", { name: "生成" }));
    fireEvent.click(screen.getByRole("button", { name: "公開設定" }));
    fireEvent.click(screen.getByRole("button", { name: "slug設定" }));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(portfolioApi.generatePortfolioContentStream).toHaveBeenCalled();
      expect(portfolioApi.savePortfolio).toHaveBeenCalled();
    });

    expect(screen.getByTestId("publish-modal")).toBeInTheDocument();
  });
});
