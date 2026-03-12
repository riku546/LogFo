import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RoadmapDetailPage from "@/app/roadmap/[id]/page";
import * as roadmapApi from "@/features/roadmap/api/roadmapApi";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ id: "roadmap-1" }),
}));

vi.mock("@/features/roadmap/components/MilestoneCard", () => ({
  MilestoneCard: () => <div data-testid="milestone-card" />,
}));

vi.mock("@/features/roadmap/components/ProgressBar", () => ({
  ProgressBar: ({ progress }: { progress: number }) => (
    <div data-testid="progress">{progress}</div>
  ),
}));

vi.mock("@/features/activity/components/ActivityDrawer", () => ({
  ActivityDrawer: () => <div data-testid="activity-drawer" />,
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/features/roadmap/api/roadmapApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/roadmap/api/roadmapApi")
  >("@/features/roadmap/api/roadmapApi");
  return {
    ...actual,
    fetchRoadmapDetail: vi.fn(),
    updateRoadmap: vi.fn(),
    deleteRoadmap: vi.fn(),
  };
});

const roadmapDetail = {
  id: "roadmap-1",
  userId: "user-1",
  currentState: "current",
  goalState: "goal",
  pdfContext: null,
  summary: "summary",
  createdAt: "2026-03-12",
  updatedAt: "2026-03-12",
  milestones: [
    {
      id: "milestone-1",
      title: "Milestone",
      description: null,
      status: "TODO" as const,
      orderIndex: 0,
      tasks: [
        {
          id: "task-1",
          title: "Task 1",
          estimatedHours: 2,
          status: "TODO" as const,
          orderIndex: 0,
        },
      ],
    },
  ],
};

describe("Roadmap detail integration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    vi.mocked(roadmapApi.fetchRoadmapDetail).mockResolvedValue(roadmapDetail);
    vi.mocked(roadmapApi.updateRoadmap).mockResolvedValue();
    vi.mocked(roadmapApi.deleteRoadmap).mockResolvedValue();
  });

  it("編集保存フローが動作する", async () => {
    render(<RoadmapDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "編集する" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "編集する" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "保存する" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => {
      expect(roadmapApi.updateRoadmap).toHaveBeenCalled();
    });
  });

  it("削除フローが動作する", async () => {
    render(<RoadmapDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => {
      expect(roadmapApi.deleteRoadmap).toHaveBeenCalledWith(
        "token-1",
        "roadmap-1",
      );
      expect(pushMock).toHaveBeenCalledWith("/roadmap");
    });
  });
});
