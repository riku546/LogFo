import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ManualRoadmapCreatePage from "@/app/roadmap/manual/page";
import * as roadmapApi from "@/features/roadmap/api/roadmapApi";

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

describe("Manual roadmap create flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-1");
    vi.mocked(roadmapApi.saveRoadmap).mockResolvedValue("roadmap-1");
  });

  it("手入力ページでCRUD操作し保存できる", async () => {
    render(<ManualRoadmapCreatePage />);

    fireEvent.click(
      screen.getByRole("button", { name: "マイルストーンを追加" }),
    );
    expect(screen.getByText("マイルストーン 2")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "マイルストーン2を削除" }),
    );
    expect(screen.queryByText("マイルストーン 2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "+ タスクを追加" }));
    expect(screen.getByText("タスク 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "タスク2を削除" }));

    fireEvent.change(screen.getByLabelText("現在の状態 *"), {
      target: { value: "現状" },
    });
    fireEvent.change(screen.getByLabelText("目標の状態 *"), {
      target: { value: "目標" },
    });
    fireEvent.change(screen.getByPlaceholderText("マイルストーン名 *"), {
      target: { value: "基礎固め" },
    });
    fireEvent.change(screen.getByPlaceholderText("タスク名 *"), {
      target: { value: "TypeScriptの復習" },
    });
    fireEvent.change(screen.getByPlaceholderText("時間(任意)"), {
      target: { value: "8" },
    });

    fireEvent.click(screen.getByRole("button", { name: "この内容で保存する" }));

    await waitFor(() => {
      expect(roadmapApi.saveRoadmap).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/roadmap/roadmap-1");
    });
  });

  it("最小条件を満たさない場合は保存できない", async () => {
    render(<ManualRoadmapCreatePage />);

    fireEvent.change(screen.getByLabelText("現在の状態 *"), {
      target: { value: "現状" },
    });
    fireEvent.change(screen.getByLabelText("目標の状態 *"), {
      target: { value: "目標" },
    });
    fireEvent.change(screen.getByPlaceholderText("マイルストーン名 *"), {
      target: { value: "学習計画" },
    });
    fireEvent.click(screen.getByRole("button", { name: "タスク1を削除" }));

    fireEvent.click(screen.getByRole("button", { name: "この内容で保存する" }));

    await waitFor(() => {
      expect(roadmapApi.saveRoadmap).not.toHaveBeenCalled();
      expect(toastErrorMock).toHaveBeenCalledWith(
        "タスクを1つ以上追加してください",
      );
    });
  });
});
