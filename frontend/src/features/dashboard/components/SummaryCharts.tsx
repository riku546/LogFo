"use client";

import { useGetDashboardStatsQuery } from "../api/dashboardComponents";

export const SummaryCharts = () => {
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  return (
    <div className="glass p-6 rounded-2xl w-full flex flex-col md:flex-row gap-6">
      {/* 統計サマリー (左側) */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-xl font-semibold mb-2">総活動数</h3>

        {isLoading ? (
          <div className="animate-pulse w-24 h-12 bg-black/10 dark:bg-white/10 rounded-lg"></div>
        ) : error ? (
          <p className="text-red-500 font-medium">取得エラー</p>
        ) : (
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              {data?.stats?.totalActivities || 0}
            </span>
            <span className="text-lg opacity-70">Activities</span>
          </div>
        )}
        <p className="text-sm opacity-60 mt-4">
          連携しているすべての外部サービスを通じた活動の合計ポイントです。
        </p>
      </div>
    </div>
  );
};
