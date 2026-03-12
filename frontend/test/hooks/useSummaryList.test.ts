import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as summaryApi from "@/features/summary/api/summaryApi";
import { useSummaryList } from "@/features/summary/hooks/useSummaryList";

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

vi.mock("@/features/summary/api/summaryApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/summary/api/summaryApi")
  >("@/features/summary/api/summaryApi");
  return {
    ...actual,
    fetchSummariesByMilestone: vi.fn(),
    deleteSummary: vi.fn(),
  };
});

describe("useSummaryList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");
  });

  it("マイルストーンのサマリー一覧を取得する", async () => {
    vi.mocked(summaryApi.fetchSummariesByMilestone).mockResolvedValue([
      {
        id: "summary-1",
        userId: "user-1",
        milestoneId: "milestone-1",
        title: "title",
        content: "content",
        createdAt: "2026-03-12",
        updatedAt: "2026-03-12",
      },
    ]);

    const { result } = renderHook(() => useSummaryList("milestone-1"));

    await waitFor(() => {
      expect(result.current.summaryList).toHaveLength(1);
    });

    expect(summaryApi.fetchSummariesByMilestone).toHaveBeenCalledWith(
      "token-1",
      "milestone-1",
    );
  });

  it("削除すると一覧から除外される", async () => {
    vi.mocked(summaryApi.fetchSummariesByMilestone).mockResolvedValue([
      {
        id: "summary-1",
        userId: "user-1",
        milestoneId: "milestone-1",
        title: "title",
        content: "content",
        createdAt: "2026-03-12",
        updatedAt: "2026-03-12",
      },
    ]);
    vi.mocked(summaryApi.deleteSummary).mockResolvedValue();

    const { result } = renderHook(() => useSummaryList("milestone-1"));

    await waitFor(() => {
      expect(result.current.summaryList).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleDelete("summary-1");
    });

    expect(summaryApi.deleteSummary).toHaveBeenCalledWith(
      "token-1",
      "summary-1",
    );
    expect(result.current.summaryList).toEqual([]);
  });

  it("未ログイン時はsigninへ遷移する", async () => {
    localStorage.removeItem("token");

    renderHook(() => useSummaryList("milestone-1"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/signin");
    });
  });
});
