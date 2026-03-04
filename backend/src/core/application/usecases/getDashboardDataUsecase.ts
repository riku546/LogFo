import type { ExternalActivityRepository } from "../interfaces/externalActivityRepository";
// ここでは簡易的にActivityLogRepositoryも必要になる想定（必要ならDIする）

export class GetDashboardDataUsecase {
  constructor(
    private readonly externalActivityRepo: ExternalActivityRepository,
    // 既存の内部活動記録（activity_logs）を取得するためのリポジトリ（一旦省略か、必要に応じて追加）
  ) {}

  private getJstDateString(date: Date, offsetDays = 0): string {
    // UTC時刻に9時間（JSTのオフセット）を足す
    const jstTime = date.getTime() + 9 * 60 * 60 * 1000;
    const jstDate = new Date(jstTime);

    // オフセット日数を足す場合は、UTCのDateメソッドを使って日付をずらす
    if (offsetDays !== 0) {
      jstDate.setUTCDate(jstDate.getUTCDate() + offsetDays);
    }

    // toISOString() は UTC として文字列化されるので、
    // +9時間された時刻の YYYY-MM-DD がそのまま JST の日付となる
    return jstDate.toISOString().split("T")[0];
  }

  /**
   * プロバイダー別ウィジェット用データの取得
   */
  async getProviderWidgetsData(userId: string) {
    // 直近10日間のデータを取得
    const today = new Date();

    const startDate = this.getJstDateString(today, -9);
    const endDate = this.getJstDateString(today, 0);

    // 過去10日間の活動を取得
    const recentActivities =
      await this.externalActivityRepo.getActivitiesByDateRange(
        userId,
        startDate,
        endDate,
      );

    // ユーザーの全活動を取得（バッテリー計算用の最終活動日取得のため）
    const allActivities =
      await this.externalActivityRepo.getAllActivitiesByUserId(userId);
    // プロバイダーごとに分類
    const providers = new Set(allActivities.map((a) => a.provider));
    const widgetsData: Record<
      string,
      {
        last10Days: { date: string; count: number }[];
        batteryLevel: number;
      }
    > = {};

    for (const provider of providers) {
      // 1. 直近10日間のデータ (棒グラフ用)
      const providerRecentActs = recentActivities.filter(
        (a) => a.provider === provider,
      );
      const last10Days: { date: string; count: number }[] = [];

      for (let i = 9; i >= 0; i--) {
        const dateStr = this.getJstDateString(today, -i);
        const act = providerRecentActs.find((a) => a.date === dateStr);
        last10Days.push({
          date: dateStr,
          count: act ? act.activityCount : 0,
        });
      }

      // 2. バッテリー計算
      const providerAllActs = allActivities
        .filter((a) => a.provider === provider && a.activityCount > 0)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ); // 日付降順

      let batteryLevel = 0;
      if (providerAllActs.length > 0) {
        // DBから返る日付（例 "2026-03-05" なのか Dateオブジェクトなのか）を安全に文字列にする
        // 万が一Date型ならUTCに引きずられないように.toISOString().split("T")[0]とする
        // （DrizzleORM+sqliteならYYYY-MM-DDの文字列の可能性が高い）
        let lastActivityDateStr = String(providerAllActs[0].date);
        if (lastActivityDateStr.includes("T")) {
          lastActivityDateStr = new Date(providerAllActs[0].date)
            .toISOString()
            .split("T")[0];
        }

        const todayZero = new Date(this.getJstDateString(today, 0));
        const lastActZero = new Date(lastActivityDateStr); // YYYY-MM-DD をパースするとUTCの0時となる

        const diffTime = Math.abs(todayZero.getTime() - lastActZero.getTime());
        const emptyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 1日未活動につき20%マイナス、0%を下限とする
        batteryLevel = Math.max(0, 100 - emptyDays * 20);
      }

      widgetsData[provider] = {
        last10Days,
        batteryLevel,
      };
    }

    return widgetsData;
  }

  /**
   * グラフ描画用統計データの取得
   */
  async getStatsData(userId: string) {
    const allActivities =
      await this.externalActivityRepo.getAllActivitiesByUserId(userId);

    let totalActivities = 0;
    const providerDistribution: Record<string, number> = {};

    for (const act of allActivities) {
      totalActivities += act.activityCount;
      providerDistribution[act.provider] =
        (providerDistribution[act.provider] || 0) + act.activityCount;
    }

    return {
      totalActivities,
      providerDistribution,
    };
  }
}
