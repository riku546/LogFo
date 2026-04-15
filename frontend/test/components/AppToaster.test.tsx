import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppToaster } from "@/components/AppToaster";

const toasterMock = vi.fn<(props: unknown) => ReactElement>(() => (
  <div data-testid="app-toaster" />
));
const useIsMobileViewportMock = vi.fn();

vi.mock("sonner", () => ({
  Toaster: (props: unknown) => toasterMock(props),
}));

vi.mock("@/hooks/useIsMobileViewport", () => ({
  useIsMobileViewport: () => useIsMobileViewportMock(),
}));

describe("AppToaster", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("モバイル幅ではヘッダー直下の中央にトーストを表示する", () => {
    useIsMobileViewportMock.mockReturnValue(true);

    render(<AppToaster />);

    expect(screen.getByTestId("app-toaster")).toBeInTheDocument();
    expect(toasterMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        position: "top-center",
        offset: 16,
        mobileOffset: {
          top: 80,
          left: 16,
          right: 16,
        },
      }),
    );
  });

  it("デスクトップ幅では右下にトーストを表示する", () => {
    useIsMobileViewportMock.mockReturnValue(false);

    render(<AppToaster />);

    expect(screen.getByTestId("app-toaster")).toBeInTheDocument();
    expect(toasterMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        position: "bottom-right",
        offset: 16,
        mobileOffset: {
          top: 80,
          left: 16,
          right: 16,
        },
      }),
    );
  });
});
