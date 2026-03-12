import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as activityApi from "@/features/activity/api/activityApi";
import { useActivityTimeline } from "@/features/activity/hooks/useActivityTimeline";

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

vi.mock("@/features/activity/api/activityApi", () => ({
  fetchActivityLogs: vi.fn(),
  createActivityLog: vi.fn(),
  updateActivityLog: vi.fn(),
  deleteActivityLog: vi.fn(),
}));

describe("useActivityTimeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
  });

  it("初回ロードで活動記録一覧を取得する", async () => {
    vi.mocked(activityApi.fetchActivityLogs).mockResolvedValue([
      {
        id: "activity-1",
        userId: "user-1",
        taskId: "task-1",
        content: "content",
        loggedDate: "2026-03-12",
        createdAt: "2026-03-12",
        updatedAt: "2026-03-12",
      },
    ]);

    const { result } = renderHook(() => useActivityTimeline("task-1"));

    await waitFor(() => {
      expect(result.current.activityLogs).toHaveLength(1);
    });
    expect(activityApi.fetchActivityLogs).toHaveBeenCalledWith(
      "token-1",
      "task-1",
    );
  });

  it("create/update/deleteでAPIを呼び、再読込する", async () => {
    vi.mocked(activityApi.fetchActivityLogs)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    vi.mocked(activityApi.createActivityLog).mockResolvedValue("activity-1");
    vi.mocked(activityApi.updateActivityLog).mockResolvedValue();
    vi.mocked(activityApi.deleteActivityLog).mockResolvedValue();

    const { result } = renderHook(() => useActivityTimeline("task-1"));

    await waitFor(() => {
      expect(activityApi.fetchActivityLogs).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.handleCreate("new", "2026-03-12");
    });
    expect(activityApi.createActivityLog).toHaveBeenCalledWith("token-1", {
      taskId: "task-1",
      content: "new",
      loggedDate: "2026-03-12",
    });

    await act(async () => {
      await result.current.handleUpdate("activity-1", "updated");
    });
    expect(activityApi.updateActivityLog).toHaveBeenCalledWith(
      "token-1",
      "activity-1",
      "updated",
    );

    await act(async () => {
      await result.current.handleDelete("activity-1");
    });
    expect(activityApi.deleteActivityLog).toHaveBeenCalledWith(
      "token-1",
      "activity-1",
    );
  });

  it("未ログイン時はsigninへ遷移する", async () => {
    localStorage.removeItem("token");

    const { result } = renderHook(() => useActivityTimeline("task-1"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/signin");
    });

    await act(async () => {
      await result.current.handleUpdate("activity-1", "updated");
    });

    expect(activityApi.updateActivityLog).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("削除confirmがfalseならAPIを呼ばない", async () => {
    vi.mocked(activityApi.fetchActivityLogs).mockResolvedValue([]);
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );

    const { result } = renderHook(() => useActivityTimeline("task-1"));
    await waitFor(() => {
      expect(activityApi.fetchActivityLogs).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.handleDelete("activity-1");
    });

    expect(activityApi.deleteActivityLog).not.toHaveBeenCalled();
  });
});
