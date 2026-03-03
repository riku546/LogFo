import type { ExternalActivityRepository } from "../interfaces/externalActivityRepository";
import type { UserIntegrationRepository } from "../interfaces/userIntegrationRepository";

export class SyncExternalDataUsecase {
  constructor(
    private readonly externalActivityRepo: ExternalActivityRepository,
    private readonly userIntegrationRepo: UserIntegrationRepository,
  ) {}

  async execute(userId: string, provider: "github" | "wakatime" | string): Promise<number> {
    // 1. プロバイダの存在チェックと連携状態の確認 (OAuthトークン等)
    const integration = await this.userIntegrationRepo.getByProvider(userId, provider);
    
    // TODO: 実際のAPI呼び出し
    // 今回はモック処理として、実行されたら過去3日分のランダムな活動データを生成し保存する
    
    const today = new Date();
    const mockData = [];
    
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      
      mockData.push({
        userId,
        provider: provider as any,
        date: dateStr,
        activityCount: Math.floor(Math.random() * 5) + 1, // 1~5のランダムなコミット/活動数
        metadata: {
          note: "Mock synced data",
        },
      });
    }

    // 2. データベースへのUpsert
    await this.externalActivityRepo.upsertActivities(mockData);

    // 追加された件数を返す
    return mockData.length;
  }
}
