import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as roadmapApi from "@/features/roadmap/api/roadmapApi";
import { useRoadmapDetail } from "@/features/roadmap/hooks/useRoadmapDetail";

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

describe("useRoadmapDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    vi.mocked(roadmapApi.fetchRoadmapDetail).mockResolvedValue(roadmapDetail);
  });

  it("取得後に編集・保存できる", async () => {
    const { result } = renderHook(() => useRoadmapDetail("roadmap-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.progress).toBe(0);

    act(() => {
      result.current.startEditing();
      result.current.changeTaskStatus(0, 0, "DONE");
    });

    expect(result.current.progress).toBe(100);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(roadmapApi.updateRoadmap).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalledWith("ロードマップを更新しました");
  });

  it("削除時にAPI呼び出しと遷移を行う", async () => {
    const { result } = renderHook(() => useRoadmapDetail("roadmap-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(roadmapApi.deleteRoadmap).toHaveBeenCalledWith(
      "token-1",
      "roadmap-1",
    );
    expect(pushMock).toHaveBeenCalledWith("/roadmap");
  });
});
