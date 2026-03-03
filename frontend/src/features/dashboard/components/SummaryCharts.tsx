"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useGetDashboardStatsQuery } from "../api/dashboardComponents";

const COLORS = {
  github: "#2563eb",
  wakatime: "#a855f7",
  zenn: "#3b82f6",
  qiita: "#22c55e",
  atcoder: "#111827",
};

export const SummaryCharts = () => {
  const { data, isLoading, error } = useGetDashboardStatsQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!data?.stats?.providerDistribution) return [];

    return Object.entries(data.stats.providerDistribution)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .filter((item) => item.value > 0);
  }, [data]);

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

      {/* グラフエリア (右側) */}
      <div className="flex-1 h-48 border-l border-black/5 dark:border-white/5 pl-0 md:pl-6 relative">
        <h3 className="text-sm font-semibold mb-2 opacity-80">活動分布</h3>
        {!mounted || isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm opacity-50">データがありません</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      COLORS[entry.name as keyof typeof COLORS] || "#64748b"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--foreground)",
                }}
                itemStyle={{ color: "inherit" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
