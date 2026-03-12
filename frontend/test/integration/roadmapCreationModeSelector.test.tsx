import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RoadmapListPage from "@/app/roadmap/page";
import { useRoadmapList } from "@/features/roadmap/hooks/useRoadmapList";

vi.mock("@/features/roadmap/hooks/useRoadmapList", () => ({
  useRoadmapList: vi.fn(),
}));

describe("Roadmap creation mode selector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("一覧ヘッダーのプルダウンにAI生成と手入力のリンクがある", () => {
    vi.mocked(useRoadmapList).mockReturnValue({
      roadmapList: [
        {
          id: "roadmap-1",
          currentState: "current",
          goalState: "goal",
          summary: null,
          createdAt: "2026-03-12",
          updatedAt: "2026-03-12",
        },
      ],
      isLoading: false,
    });

    render(<RoadmapListPage />);

    const aiLink = screen.getByRole("link", { name: "AIで生成" });
    const manualLink = screen.getByRole("link", { name: "手入力で作成" });

    expect(aiLink).toHaveAttribute("href", "/roadmap/generate");
    expect(manualLink).toHaveAttribute("href", "/roadmap/manual");
  });

  it("空状態でも同じ作成方式リンクが表示される", () => {
    vi.mocked(useRoadmapList).mockReturnValue({
      roadmapList: [],
      isLoading: false,
    });

    render(<RoadmapListPage />);

    const aiLinks = screen.getAllByRole("link", { name: "AIで生成" });
    const manualLinks = screen.getAllByRole("link", { name: "手入力で作成" });

    expect(aiLinks.length).toBeGreaterThanOrEqual(1);
    expect(manualLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of aiLinks) {
      expect(link).toHaveAttribute("href", "/roadmap/generate");
    }
    for (const link of manualLinks) {
      expect(link).toHaveAttribute("href", "/roadmap/manual");
    }
  });
});
