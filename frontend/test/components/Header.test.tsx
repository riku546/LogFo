import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/Header";
import { fetchAuthSession } from "@/features/auth/api/authApi";

const pushMock = vi.fn();
const pathnameState = {
  value: "/roadmap",
};

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/theme-provider", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: vi.fn(),
  }),
}));

vi.mock("@/features/auth/api/authApi", () => ({
  fetchAuthSession: vi.fn(),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    pathnameState.value = "/roadmap";
  });

  it("tokenなしの場合はログインボタンを表示する", async () => {
    localStorage.clear();
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションメニューを開く" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "認証アクション" }),
      ).toHaveTextContent("ログイン");
    });
  });

  it("tokenありかつsession成功時はログアウトボタンを表示する", async () => {
    localStorage.setItem("token", "token-1");
    vi.mocked(fetchAuthSession).mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
    });
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションメニューを開く" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "認証アクション" }),
      ).toHaveTextContent("ログアウト");
    });
  });

  it("ログアウト押下でsigninへ遷移しtokenを削除する", async () => {
    localStorage.setItem("token", "token-1");
    vi.mocked(fetchAuthSession).mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
    });
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションメニューを開く" }),
    );

    const authButton = await screen.findByRole("button", {
      name: "認証アクション",
    });
    fireEvent.click(authButton);

    expect(localStorage.getItem("token")).toBeNull();
    expect(pushMock).toHaveBeenCalledWith("/signin");
    await waitFor(() => {
      expect(screen.queryByText("メニュー")).not.toBeInTheDocument();
    });
  });

  it("ログイン押下でsigninへ遷移しSheetを閉じる", async () => {
    localStorage.clear();
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションメニューを開く" }),
    );

    const authButton = await screen.findByRole("button", {
      name: "認証アクション",
    });
    fireEvent.click(authButton);

    expect(pushMock).toHaveBeenCalledWith("/signin");
    await waitFor(() => {
      expect(screen.queryByText("メニュー")).not.toBeInTheDocument();
    });
  });

  it("pathname変更時に認証状態を再評価する", async () => {
    localStorage.setItem("token", "token-1");
    vi.mocked(fetchAuthSession).mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
    });
    const { rerender } = render(<Header />);

    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションメニューを開く" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "認証アクション" }),
      ).toHaveTextContent("ログアウト");
    });

    pathnameState.value = "/";
    rerender(<Header />);

    await waitFor(() => {
      expect(fetchAuthSession).toHaveBeenCalledTimes(2);
    });
  });

  it("メニューを開くとナビゲーションリンクを表示する", () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションメニューを開く" }),
    );

    expect(
      screen.getByRole("button", { name: "認証アクション" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションメニューを開く" }),
    );

    expect(
      screen.getAllByRole("link", { name: "ホーム" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "ロードマップ" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "ダッシュボード" }).length,
    ).toBeGreaterThan(0);
  });

  it("ハンバーガーメニューを開いて閉じられる", () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションメニューを開く" }),
    );
    expect(
      screen.getByRole("button", { name: "認証アクション" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションメニューを開く" }),
    );

    expect(screen.getByText("メニュー")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "サイドバーでテーマを切り替える" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("メニュー")).not.toBeInTheDocument();
  });
});
