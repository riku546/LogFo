"use client";

import { useMemo } from "react";
import { useGetDashboardHeatmapQuery } from "../api/dashboardComponents";

export const ContributionsHeatmap = () => {
  const { data, isLoading, error } = useGetDashboardHeatmapQuery();

  // SVGで簡易的にヒートマップを描画する（D3やreact-calendar-heatmapの代用）
  const heatmapCells = useMemo(() => {
    if (!data?.heatmapData) return [];

    const getLevel = (count: number) => {
      if (count === 0) return 0;
      if (count <= 2) return 1;
      if (count <= 5) return 2;
      if (count <= 8) return 3;
      return 4;
    };

    const countMap = new Map<string, number>();
    for (const d of data.heatmapData) {
      countMap.set(d.date, d.totalCount);
    }

    const cells = [];
    const today = new Date();
    for (let i = 100; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = countMap.get(dateStr) || 0;

      cells.push({
        date: dateStr,
        count,
        level: getLevel(count),
      });
    }
    return cells;
  }, [data]);

  return (
    <div className="glass p-6 rounded-2xl w-full overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4">
        アクティビティ・ヒートマップ
      </h3>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center animate-pulse bg-black/5 dark:bg-white/5 rounded-lg">
          <p className="text-sm opacity-60">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="h-32 flex items-center justify-center text-red-500 bg-red-500/10 rounded-lg">
          データの取得に失敗しました。
        </div>
      ) : heatmapCells.length === 0 ? (
        <div className="h-32 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg">
          <p className="text-sm opacity-60">まだ活動データがありません。</p>
        </div>
      ) : (
        <div className="flex gap-1 flex-wrap max-w-full">
          {/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: UI表現のためのクラス分岐に起因 */}
          {heatmapCells.map((cell) => {
            const bgClass =
              cell.level === 0
                ? "bg-black/5 dark:bg-white/10"
                : cell.level === 1
                  ? "bg-blue-300 dark:bg-blue-900"
                  : cell.level === 2
                    ? "bg-blue-500 dark:bg-blue-700"
                    : cell.level === 3
                      ? "bg-blue-600 dark:bg-blue-600"
                      : "bg-blue-700 dark:bg-blue-500";

            return (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} activities`}
                className={`w-4 h-4 rounded-sm ${bgClass} transition-colors duration-200 hover:opacity-80 cursor-pointer`}
              />
            );
          })}
        </div>
      )}
      <div className="mt-4 flex items-center justify-end space-x-2 text-xs opacity-70">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-black/5 dark:bg-white/10" />
        <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-900" />
        <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-700" />
        <div className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-600" />
        <div className="w-3 h-3 rounded-sm bg-blue-700 dark:bg-blue-500" />
        <span>More</span>
      </div>
    </div>
  );
};
