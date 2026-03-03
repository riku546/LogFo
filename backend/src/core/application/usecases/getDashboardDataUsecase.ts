import type { ExternalActivityRepository } from "../interfaces/externalActivityRepository";
import type { ActivityLogRepository } from "../interfaces/activityLogRepository";
// ここでは簡易的にActivityLogRepositoryも必要になる想定（必要ならDIする）

export class GetDashboardDataUsecase {
  constructor(
    private readonly externalActivityRepo: ExternalActivityRepository,
    // 既存の内部活動記録（activity_logs）を取得するためのリポジトリ（一旦省略か、必要に応じて追加）
  ) {}

  /**
   * ヒートマップ描画用データの取得
   */
  async getHeatmapData(userId: string, startDate: string, endDate: string) {
    // 1. 外部活動の取得
    const externalActivities = await this.externalActivityRepo.getActivitiesByDateRange(
      userId,
      startDate,
      endDate,
    );

    // 2. 本来はここで activity_logs テーブルのデータも取得し合算するが、
    // ここでは外部活動をベースに返す
    
    // 日付ごとにカウントを集計
    const heatmapMap = new Map<string, number>();

    for (const act of externalActivities) {
      const current = heatmapMap.get(act.date) || 0;
      heatmapMap.set(act.date, current + act.activityCount);
    }

    const heatmapData = Array.from(heatmapMap.entries()).map(([date, totalCount]) => ({
      date,
      totalCount,
    }));

    return heatmapData;
  }

  /**
   * グラフ描画用統計データの取得
   */
  async getStatsData(userId: string) {
    const allActivities = await this.externalActivityRepo.getAllActivitiesByUserId(userId);

    let totalActivities = 0;
    const providerDistribution: Record<string, number> = {};

    for (const act of allActivities) {
      totalActivities += act.activityCount;
      providerDistribution[act.provider] = (providerDistribution[act.provider] || 0) + act.activityCount;
    }

    return {
      totalActivities,
      providerDistribution,
    };
  }
}
