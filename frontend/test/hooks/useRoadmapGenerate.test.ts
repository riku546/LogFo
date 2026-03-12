import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as roadmapApi from "@/features/roadmap/api/roadmapApi";
import { useRoadmapGenerate } from "@/features/roadmap/hooks/useRoadmapGenerate";

const {
  pushMock,
  toastErrorMock,
  toastSuccessMock,
  submitMock,
  stopMock,
  routerMock,
} = vi.hoisted(() => {
  const push = vi.fn();
  return {
    pushMock: push,
    toastErrorMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    submitMock: vi.fn(),
    stopMock: vi.fn(),
    routerMock: { push },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

vi.mock("react-dropzone", () => ({
  useDropzone: vi.fn(() => ({
    getRootProps: vi.fn(),
    getInputProps: vi.fn(),
    isDragActive: false,
  })),
}));

vi.mock("@ai-sdk/react", () => ({
  experimental_useObject: vi.fn(() => ({
    submit: submitMock,
    object: {
      summary: "summary",
      milestones: [
        {
          title: "milestone",
          description: "desc",
          tasks: [{ title: "task", estimatedHours: 3 }],
        },
      ],
    },
    stop: stopMock,
    isLoading: false,
  })),
}));

vi.mock("@/features/roadmap/api/roadmapApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/roadmap/api/roadmapApi")
  >("@/features/roadmap/api/roadmapApi");
  return {
    ...actual,
    roadmapGenerateFetch: vi.fn(),
    saveRoadmap: vi.fn(),
  };
});

describe("useRoadmapGenerate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");
    vi.mocked(roadmapApi.saveRoadmap).mockResolvedValue("roadmap-1");
  });

  it("スキル未選択時は生成しない", () => {
    const { result } = renderHook(() => useRoadmapGenerate());

    act(() => {
      result.current.handleGenerate({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(submitMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "経験のあるスキルを1つ以上選択してください",
    );
  });

  it("生成リクエストをsubmitし、保存できる", async () => {
    const { result } = renderHook(() => useRoadmapGenerate());

    act(() => {
      result.current.setCurrentOccupation("student");
      result.current.toggleSkill("TypeScript");
      result.current.setTargetPosition("frontend engineer");
      result.current.setTargetCompanies("A, B");
      result.current.setTargetSkills("React");
    });

    act(() => {
      result.current.handleGenerate({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(submitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        currentOccupation: "student",
        currentSkills: ["TypeScript"],
        targetCompanies: ["A", "B"],
      }),
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(roadmapApi.saveRoadmap).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/roadmap/roadmap-1");
    expect(result.current.stopGeneration).toBe(stopMock);
  });

  it("未ログイン時はsigninへ遷移する", () => {
    vi.spyOn(window.localStorage, "getItem").mockReturnValue(null);
    const { result } = renderHook(() => useRoadmapGenerate());

    act(() => {
      result.current.toggleSkill("TypeScript");
    });

    act(() => {
      result.current.handleGenerate({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(pushMock).toHaveBeenCalledWith("/signin");
  });
});
