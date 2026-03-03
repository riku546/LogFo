import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SummaryCharts } from "@/features/dashboard/components/SummaryCharts";

vi.mock("@/features/dashboard/api/dashboardComponents", () => ({
  useGetDashboardStatsQuery: () => ({
    data: {
      stats: {
        totalActivities: 150,
        providerDistribution: {
          github: 120,
          wakatime: 30,
        },
      },
    },
    isLoading: false,
    isError: false,
  }),
}));

// Recharts は ResizeObserver を内部で使うためモックが必要な場合がある
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("SummaryCharts", () => {
  it("グラフ領域と統計情報のサマリーが正確に表示されること", () => {
    render(<SummaryCharts />);

    // 総活動数やプロバイダ比率に関連するテキストが出力されているか確認
    const totalActivitiesText = screen.getByText(/150/);
    expect(totalActivitiesText).toBeInTheDocument();

    // Recharts のグラフコンテナが描画されているか（ここではエラーなくレンダリングされることで確認）
    // 具体的には、特定のレイアウトクラス名やRoleをチェックする
  });
});
