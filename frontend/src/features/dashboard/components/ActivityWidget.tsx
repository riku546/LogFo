"use client";

import { useGetProviderWidgetsQuery } from "../api/dashboardComponents";
import { ProviderActivityWidget } from "./ProviderActivityWidget";

export const ContributionsHeatmap = () => {
  const { data, isLoading, error } = useGetProviderWidgetsQuery();

  const widgetsData = data?.widgetsData;
  const providers = widgetsData ? Object.keys(widgetsData) : [];

  // SWRでデータフェッチが完了していない状態（初回データなし＆エラーなし）もローディングとする
  const isInitialLoading = isLoading || !(data || error);

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4 px-1">
        アクティビティ・ウィジェット
      </h3>

      {isInitialLoading ? (
        <div className="h-32 flex items-center justify-center animate-pulse bg-black/5 dark:bg-white/5 rounded-2xl glass">
          <p className="text-sm opacity-60">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="h-32 flex items-center justify-center text-red-500 bg-red-500/10 rounded-2xl p-6">
          データの取得に失敗しました。
        </div>
      ) : providers.length === 0 ? (
        <div className="h-32 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-2xl glass p-6">
          <p className="text-sm opacity-60">
            まだ活動データがありません。連携を設定してデータを同期してください。
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {providers.map((provider) => {
            const providerData = widgetsData?.[provider];
            if (!providerData) return null;
            return (
              <ProviderActivityWidget
                key={provider}
                provider={provider}
                data={providerData}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
