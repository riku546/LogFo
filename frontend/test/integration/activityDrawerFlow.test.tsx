import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as activityApi from "@/features/activity/api/activityApi";
import { ActivityDrawer } from "@/features/activity/components/ActivityDrawer";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/features/activity/api/activityApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/activity/api/activityApi")
  >("@/features/activity/api/activityApi");
  return {
    ...actual,
    fetchActivityLogs: vi.fn(),
    createActivityLog: vi.fn(),
    updateActivityLog: vi.fn(),
    deleteActivityLog: vi.fn(),
  };
});

describe("Activity drawer integration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );

    vi.mocked(activityApi.fetchActivityLogs).mockResolvedValue([]);
    vi.mocked(activityApi.createActivityLog).mockResolvedValue("activity-1");
    vi.mocked(activityApi.updateActivityLog).mockResolvedValue();
    vi.mocked(activityApi.deleteActivityLog).mockResolvedValue();
  });

  it("入力して保存すると活動記録作成APIが呼ばれる", async () => {
    render(
      <ActivityDrawer
        isOpen
        taskId="task-1"
        taskTitle="Task Title"
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(activityApi.fetchActivityLogs).toHaveBeenCalledWith(
        "token-1",
        "task-1",
      );
    });

    fireEvent.change(
      screen.getByPlaceholderText(/今日の学びを書いてみましょう/i),
      {
        target: { value: "学習内容" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: /記録を保存/i }));

    await waitFor(() => {
      expect(activityApi.createActivityLog).toHaveBeenCalled();
    });
  });
});
