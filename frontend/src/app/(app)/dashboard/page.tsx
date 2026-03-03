import { LayoutDashboard } from "lucide-react";
import { ContributionsHeatmap } from "../../../features/dashboard/components/ContributionsHeatmap";
import { IntegrationSyncPanel } from "../../../features/dashboard/components/IntegrationSyncPanel";
import { SummaryCharts } from "../../../features/dashboard/components/SummaryCharts";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-2xl">
          <LayoutDashboard className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-sm opacity-70 mt-1">
            外部サービスとの連携と活動記録の可視化
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側カラム：サマリーと同期パネル */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <SummaryCharts />
          <IntegrationSyncPanel />
        </div>

        {/* 右側カラム：ヒートマップ等 */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <ContributionsHeatmap />

          <div className="glass p-6 rounded-2xl w-full min-h-[300px] flex items-center justify-center bg-[url('/noise.png')] bg-repeat bg-[length:100px_100px] opacity-90">
            <div className="text-center">
              <h4 className="text-lg font-medium opacity-80 mb-2">
                アクティビティログ (Coming Soon)
              </h4>
              <p className="text-sm opacity-60">
                ここに日別の学習内容やコミット履歴のリストが表示される予定です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
