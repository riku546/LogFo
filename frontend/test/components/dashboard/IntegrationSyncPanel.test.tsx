import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as dashboardApi from "../../../src/features/dashboard/api/dashboardComponents";
import { IntegrationSyncPanel } from "../../../src/features/dashboard/components/IntegrationSyncPanel";

vi.mock("../../../src/features/dashboard/api/dashboardComponents", () => ({
  fetchIntegrationRedirectUrl: vi.fn().mockResolvedValue("https://example.com"),
  useGetIntegrationStatusQuery: vi.fn(() => ({
    data: {
      integrations: [],
    },
  })),
  useSyncExternalData: vi.fn(() => ({
    syncData: vi.fn(),
  })),
}));

describe("IntegrationSyncPanel", () => {
  let originalWindowLocation: Location;
  const mockedFetchIntegrationRedirectUrl = vi.mocked(
    dashboardApi.fetchIntegrationRedirectUrl,
  );
  const mockedUseGetIntegrationStatusQuery = vi.mocked(
    dashboardApi.useGetIntegrationStatusQuery,
  );
  const mockedUseSyncExternalData = vi.mocked(dashboardApi.useSyncExternalData);
  const syncDataMock = vi.fn();

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
    mockedFetchIntegrationRedirectUrl.mockResolvedValue("https://example.com");
    mockedUseGetIntegrationStatusQuery.mockReturnValue({
      data: { integrations: [] },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });
    mockedUseSyncExternalData.mockReturnValue({
      syncData: syncDataMock,
    });
    syncDataMock.mockReset();
    vi.stubGlobal("alert", vi.fn());

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
      // API関数が呼ばれたこと
      expect(mockedFetchIntegrationRedirectUrl).toHaveBeenCalledWith(
        "mock-token",
        "github",
      );
      // location.href が書き換わっていること
      expect(window.location.href).toBe("https://example.com");
    });
  });

  it("同期で401が返った場合に再連携へリダイレクトする", async () => {
    mockedUseGetIntegrationStatusQuery.mockReturnValue({
      data: {
        integrations: [{ provider: "github", connected: true }],
      },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });
    syncDataMock.mockRejectedValue({ status: 401, provider: "github" });

    render(<IntegrationSyncPanel />);

    const syncNowButton = screen.getByRole("button", { name: "今すぐ同期" });
    fireEvent.click(syncNowButton);

    await waitFor(() => {
      expect(syncDataMock).toHaveBeenCalledWith("github");
      expect(mockedFetchIntegrationRedirectUrl).toHaveBeenCalledWith(
        "mock-token",
        "github",
      );
      expect(window.location.href).toBe("https://example.com");
    });
  });
});
