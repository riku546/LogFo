import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContributionsHeatmap } from "../../../src/features/dashboard/components/ActivityWidget";

// React Query Hook is mocked for returning mock heatmap data
vi.mock("../../../src/features/dashboard/api/dashboardComponents", () => ({
  useGetDashboardHeatmapQuery: () => ({
    data: {
      heatmapData: [
        { date: "2026-03-01", totalCount: 2 },
        { date: "2026-03-02", totalCount: 5 },
        { date: "2026-03-03", totalCount: 1 },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

describe("ContributionsHeatmap", () => {
  it("モックデータを反映したヒートマップコンポーネントが描画されること", () => {
    // コンポーネントがエラーなくマウントされるかテスト
    render(<ContributionsHeatmap />);

    // データがあること（ローディング状態ではないこと）を確認するアサーション
    const title = screen.getByText(/アクティビティ・ヒートマップ/i);
    expect(title).toBeInTheDocument();

    // 草の四角形(SVGのrectやreact-calendar-heatmapのセル等)が描画されているかをテストする場合には、
    // ここにセレクタを追加する。今回はマウントと基本表示のみの確認。
  });
});
