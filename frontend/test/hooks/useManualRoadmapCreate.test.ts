import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as roadmapApi from "@/features/roadmap/api/roadmapApi";
import { useManualRoadmapCreate } from "@/features/roadmap/hooks/useManualRoadmapCreate";

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
    saveRoadmap: vi.fn(),
  };
});

describe("useManualRoadmapCreate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");
    vi.mocked(roadmapApi.saveRoadmap).mockResolvedValue("roadmap-1");
  });

  it("手入力データを編集して保存できる", async () => {
    const { result } = renderHook(() => useManualRoadmapCreate());

    act(() => {
      result.current.setCurrentState("現在地");
      result.current.setGoalState("目的地");
      result.current.setSummary("要約");
      result.current.updateMilestoneTitle(0, "基礎学習");
      result.current.updateMilestoneDescription(0, "土台作り");
      result.current.updateTaskTitle(0, 0, "TypeScriptを学ぶ");
      result.current.updateTaskEstimatedHours(0, 0, 12);
      result.current.addMilestone();
      result.current.removeMilestone(1);
      result.current.addTask(0);
      result.current.removeTask(0, 1);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(roadmapApi.saveRoadmap).toHaveBeenCalledWith(
      "token-1",
      expect.objectContaining({
        currentState: "現在地",
        goalState: "目的地",
        summary: "要約",
        milestones: [
          expect.objectContaining({
            title: "基礎学習",
            description: "土台作り",
            tasks: [
              expect.objectContaining({
                title: "TypeScriptを学ぶ",
                estimatedHours: 12,
              }),
            ],
          }),
        ],
      }),
    );
    expect(toastSuccessMock).toHaveBeenCalledWith("ロードマップを保存しました");
    expect(pushMock).toHaveBeenCalledWith("/roadmap/roadmap-1");
  });

  it("最小条件を満たさない場合は保存しない", async () => {
    const { result } = renderHook(() => useManualRoadmapCreate());

    await act(async () => {
      await result.current.handleSave();
    });

    expect(roadmapApi.saveRoadmap).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("未ログイン時は保存時にサインインへ遷移する", async () => {
    localStorage.clear();
    const { result } = renderHook(() => useManualRoadmapCreate());

    act(() => {
      result.current.setCurrentState("現在地");
      result.current.setGoalState("目的地");
      result.current.updateMilestoneTitle(0, "基礎");
      result.current.updateTaskTitle(0, 0, "タスク");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(pushMock).toHaveBeenCalledWith("/signin");
    expect(roadmapApi.saveRoadmap).not.toHaveBeenCalled();
  });
});
