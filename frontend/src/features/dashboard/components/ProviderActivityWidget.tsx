"use client";

import { useMemo } from "react";

type ProviderActivityWidgetProps = {
  provider: string;
  data: {
    last10Days: { date: string; count: number }[];
    batteryLevel: number;
  };
};

export const ProviderActivityWidget = ({
  provider,
  data,
}: ProviderActivityWidgetProps) => {
  const { last10Days, batteryLevel } = data;

  // バッテリーの色を決定する
  const batteryColorClass = useMemo(() => {
    if (batteryLevel >= 80) return "bg-green-500";
    if (batteryLevel >= 50) return "bg-yellow-500";
    if (batteryLevel >= 20) return "bg-orange-500";
    return "bg-red-500";
  }, [batteryLevel]);

  // グラフの最大値を取得して高さを計算
  const maxActivity = useMemo(() => {
    return Math.max(...last10Days.map((d) => d.count), 1); // 0除算を防ぐため最低1
  }, [last10Days]);

  return (
    <div className="glass p-5 rounded-2xl w-full flex flex-col gap-4">
      {/* ヘッダー: プロバイダー名とバッテリー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold capitalize flex items-center gap-2">
          {provider}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{batteryLevel}%</span>
          <div className="w-16 h-4 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden border border-black/20 dark:border-white/20">
            <div
              className={`h-full transition-all duration-500 ${batteryColorClass}`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* グラフ: 直近10日間 */}
      <div className="flex items-end justify-between h-40 gap-1 mt-4">
        {last10Days.map((day) => {
          // 高さをパーセンテージで計算 (最低高さを5%にして見えなくならないようにする)
          const heightPercent =
            day.count > 0 ? Math.max((day.count / maxActivity) * 100, 5) : 0;

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col justify-end items-center group relative h-full"
            >
              {/* ツールチップ */}
              <div className="absolute -top-8 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {day.date}: {day.count}
              </div>

              {/* バー本体 */}
              <div className="w-full bg-black/5 dark:bg-white/5 rounded-t-sm overflow-hidden h-full flex items-end">
                <div
                  className="w-full bg-blue-500 dark:bg-blue-400 transition-all duration-300 rounded-t-sm"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X軸ラベル */}
      <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
        <span>{last10Days[0]?.date.slice(5).replace("-", "/")}</span>
        <span>Today</span>
      </div>
    </div>
  );
};
