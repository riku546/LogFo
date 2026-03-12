import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useActivityEditor } from "@/features/activity/hooks/useActivityEditor";

describe("useActivityEditor", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("下書きを復元し、toggle/clearが動作する", () => {
    localStorage.setItem("logfo_activity_draft_task-1", "saved draft");

    const { result } = renderHook(() => useActivityEditor("task-1"));

    expect(result.current.content).toBe("saved draft");
    expect(result.current.isPreview).toBe(false);

    act(() => {
      result.current.togglePreview();
    });
    expect(result.current.isPreview).toBe(true);

    act(() => {
      result.current.clearDraft();
    });

    expect(result.current.content).toBe("");
    expect(localStorage.getItem("logfo_activity_draft_task-1")).toBeNull();
  });

  it("500ms後に下書き保存される", () => {
    const { result } = renderHook(() => useActivityEditor("task-1"));

    act(() => {
      result.current.setContent("new draft");
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(localStorage.getItem("logfo_activity_draft_task-1")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(localStorage.getItem("logfo_activity_draft_task-1")).toBe(
      "new draft",
    );
  });
});
