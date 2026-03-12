import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as roadmapApi from "@/features/roadmap/api/roadmapApi";
import { useRoadmapList } from "@/features/roadmap/hooks/useRoadmapList";

const { pushMock, toastErrorMock, routerMock } = vi.hoisted(() => {
  const push = vi.fn();
  return {
    pushMock: push,
    toastErrorMock: vi.fn(),
    routerMock: { push },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: vi.fn(),
  },
}));

vi.mock("@/features/roadmap/api/roadmapApi", () => ({
  fetchRoadmapList: vi.fn(),
}));

describe("useRoadmapList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("ロードマップ一覧を取得する", async () => {
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

    const { result } = renderHook(() => useRoadmapList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.roadmapList).toHaveLength(1);
    expect(roadmapApi.fetchRoadmapList).toHaveBeenCalledWith("token-1");
  });

  it("未ログインならsigninへ遷移する", async () => {
    const { result } = renderHook(() => useRoadmapList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    expect(pushMock).toHaveBeenCalledWith("/signin");
    expect(toastErrorMock).toHaveBeenCalled();
  });
});
