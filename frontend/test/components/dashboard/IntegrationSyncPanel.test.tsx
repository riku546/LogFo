import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IntegrationSyncPanel } from "../../../src/features/dashboard/components/IntegrationSyncPanel";

// React Queryのモック等が必要になるが、コンポーネントでラップしてテストするか、Hooksをモックする
vi.mock("../../../src/features/dashboard/api/dashboardComponents", () => ({
  useSyncExternalData: () => ({
    syncData: vi
      .fn()
      .mockResolvedValue({ message: "Success", syncedItemsCount: 5 }),
  }),
}));

describe("IntegrationSyncPanel", () => {
  it("正しくレンダリングされ、モックの連携ボタンが機能する", async () => {
    render(<IntegrationSyncPanel />);

    // 連携ボタンが表示されているか（全プロバイダのボタンが取得されるため最初のものをテスト対象とする）
    const syncBtns = screen.getAllByRole("button", { name: /連携する/i });
    expect(syncBtns.length).toBeGreaterThan(0);
    const firstSyncBtn = syncBtns[0];

    // クリック処理が走るか（リダイレクト処理への変更）
    fireEvent.click(firstSyncBtn);

    // リダイレクトされる際、ローディング表示（Disabled）になることを確認する
    await waitFor(() => {
      expect(firstSyncBtn).toBeDisabled();
    });
  });
});
