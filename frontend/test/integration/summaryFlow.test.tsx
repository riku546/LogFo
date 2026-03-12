import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SummaryPage from "@/app/(app)/summary/page";
import * as roadmapApi from "@/features/roadmap/api/roadmapApi";
import * as summaryApi from "@/features/summary/api/summaryApi";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/features/summary/components/SummaryChatStream", () => ({
  SummaryChatStream: ({ streamedText }: { streamedText: string }) => (
    <div data-testid="stream">{streamedText}</div>
  ),
}));

vi.mock("@/features/summary/components/SummaryConfigPanel", () => ({
  SummaryConfigPanel: ({
    milestones,
    onMilestoneChange,
    onGenerate,
  }: {
    milestones: Array<{ id: string }>;
    onMilestoneChange: (value: string) => void;
    onGenerate: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onMilestoneChange(milestones[0]?.id ?? "")}
      >
        マイルストーン選択
      </button>
      <button type="button" onClick={onGenerate}>
        生成開始
      </button>
    </div>
  ),
}));

vi.mock("@/features/summary/components/SummaryEditor", () => ({
  SummaryEditor: ({
    onSave,
    onTitleChange,
    onContentChange,
  }: {
    onSave: () => void;
    onTitleChange: (value: string) => void;
    onContentChange: (value: string) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onTitleChange("Title")}>
        title
      </button>
      <button type="button" onClick={() => onContentChange("Content")}>
        content
      </button>
      <button type="button" onClick={onSave}>
        保存する
      </button>
    </div>
  ),
}));

vi.mock("@/features/summary/components/SummaryListItem", () => ({
  SummaryListItem: () => <div data-testid="summary-list-item" />,
}));

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
    summaryGenerateFetch: vi.fn(),
    saveSummary: vi.fn(),
    fetchSummariesByMilestone: vi.fn(),
    deleteSummary: vi.fn(),
  };
});

const createTextStreamResponse = (text: string) => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return new Response(stream, { status: 200 });
};

describe("Summary integration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");

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
      milestones: [
        {
          id: "milestone-1",
          title: "Milestone 1",
          description: null,
          status: "TODO",
          orderIndex: 0,
          tasks: [],
        },
      ],
    });
    vi.mocked(summaryApi.fetchSummariesByMilestone).mockResolvedValue([]);
    vi.mocked(summaryApi.summaryGenerateFetch).mockResolvedValue(
      createTextStreamResponse("generated summary"),
    );
    vi.mocked(summaryApi.saveSummary).mockResolvedValue("summary-1");
  });

  it("生成から保存までのフローが動作する", async () => {
    render(<SummaryPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("対象ロードマップ")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("対象ロードマップ"), {
      target: { value: "roadmap-1" },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "生成開始" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "マイルストーン選択" }));
    fireEvent.click(screen.getByRole("button", { name: "生成開始" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "保存する" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "title" }));
    fireEvent.click(screen.getByRole("button", { name: "content" }));
    fireEvent.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => {
      expect(summaryApi.saveSummary).toHaveBeenCalled();
    });
  });
});
