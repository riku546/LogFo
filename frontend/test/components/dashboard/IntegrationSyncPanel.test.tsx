import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationSyncPanel } from "../../../src/features/dashboard/components/IntegrationSyncPanel";

describe("IntegrationSyncPanel", () => {
  let originalWindowLocation: Location;

  beforeEach(() => {
    // location のモック（location.href 代入時のエラー回避）
    originalWindowLocation = window.location;
    Reflect.deleteProperty(window, "location");
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: {
        ...originalWindowLocation,
        href: "http://localhost/",
      },
    });

    // fetch のモック
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ redirectUrl: "https://example.com" }),
      }),
    );

    // localStorage のモック
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => "mock-token"),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: originalWindowLocation,
    });
    vi.restoreAllMocks();
  });

  it("正しくレンダリングされ、連携ボタンクリックでリダイレクトAPIが呼ばれる", async () => {
    render(<IntegrationSyncPanel />);

    const syncBtns = screen.getAllByRole("button", { name: /連携する/i });
    expect(syncBtns.length).toBeGreaterThan(0);
    const firstSyncBtn = syncBtns[0];

    fireEvent.click(firstSyncBtn);

    await waitFor(() => {
      // 遷移中状態になること
      expect(firstSyncBtn).toBeDisabled();
      // APIが呼ばれたこと
      expect(global.fetch).toHaveBeenCalled();
      // location.href が書き換わっていること
      expect(window.location.href).toBe("https://example.com");
    });
  });
});
