import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as summaryApi from "@/features/summary/api/summaryApi";
import { useSummaryGenerate } from "@/features/summary/hooks/useSummaryGenerate";

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
    summaryGenerateFetch: vi.fn(),
    saveSummary: vi.fn(),
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

describe("useSummaryGenerate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");
    vi.mocked(summaryApi.summaryGenerateFetch).mockResolvedValue(
      createTextStreamResponse("generated summary"),
    );
    vi.mocked(summaryApi.saveSummary).mockResolvedValue("summary-1");
  });

  it("生成して編集内容に反映する", async () => {
    const { result } = renderHook(() => useSummaryGenerate());

    act(() => {
      result.current.setSelectedMilestoneId("milestone-1");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    await waitFor(() => {
      expect(result.current.isGenerated).toBe(true);
    });

    expect(result.current.editedContent).toBe("generated summary");
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "サマリーの生成が完了しました",
    );
  });

  it("保存後に状態をリセットする", async () => {
    const { result } = renderHook(() => useSummaryGenerate());

    act(() => {
      result.current.setSelectedMilestoneId("milestone-1");
      result.current.setSummaryTitle("title");
      result.current.setEditedContent("content");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(summaryApi.saveSummary).toHaveBeenCalledWith("token-1", {
      milestoneId: "milestone-1",
      title: "title",
      content: "content",
    });
    expect(result.current.summaryTitle).toBe("");
    expect(result.current.editedContent).toBe("");
  });

  it("未ログイン時はsigninへ遷移する", async () => {
    localStorage.removeItem("token");
    const { result } = renderHook(() => useSummaryGenerate());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(pushMock).toHaveBeenCalledWith("/signin");
  });
});
