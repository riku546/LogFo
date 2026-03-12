import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as dashboardApi from "@/features/dashboard/api/dashboardComponents";
import { IntegrationSyncPanel } from "@/features/dashboard/components/IntegrationSyncPanel";

const syncDataMock = vi.fn();

vi.mock("@/features/dashboard/api/dashboardComponents", () => ({
  fetchIntegrationRedirectUrl: vi.fn().mockResolvedValue("https://example.com"),
  useGetIntegrationStatusQuery: vi.fn(() => ({
    data: {
      integrations: [{ provider: "github", connected: true }],
    },
  })),
  useSyncExternalData: vi.fn(() => ({
    syncData: syncDataMock,
  })),
}));

describe("Dashboard sync integration", () => {
  let originalWindowLocation: Location;

  beforeEach(() => {
    vi.clearAllMocks();
    syncDataMock.mockRejectedValue({ status: 401, provider: "github" });

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
  });

  it("401時は再連携リダイレクトに遷移する", async () => {
    const fetchRedirectMock = vi.mocked(
      dashboardApi.fetchIntegrationRedirectUrl,
    );

    render(<IntegrationSyncPanel />);

    fireEvent.click(screen.getByRole("button", { name: "今すぐ同期" }));

    await waitFor(() => {
      expect(syncDataMock).toHaveBeenCalledWith("github");
      expect(fetchRedirectMock).toHaveBeenCalledWith("mock-token", "github");
      expect(window.location.href).toBe("https://example.com");
    });
  });
});
