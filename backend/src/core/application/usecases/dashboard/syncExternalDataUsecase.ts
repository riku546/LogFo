import type { ExternalActivityRepository } from "../../interfaces/externalActivityRepository";
import type {
  GithubContributionDay,
  GithubContributionService,
} from "../../interfaces/githubContributionService";
import type { UserIntegrationRepository } from "../../interfaces/userIntegrationRepository";
import type {
  WakatimeSummary,
  WakatimeSummaryService,
} from "../../interfaces/wakatimeSummaryService";

export class SyncExternalDataUsecase {
  constructor(
    private readonly externalActivityRepo: ExternalActivityRepository,
    private readonly userIntegrationRepo: UserIntegrationRepository,
    private readonly githubService: GithubContributionService,
    private readonly wakatimeService: WakatimeSummaryService,
  ) {}

  async execute(userId: string, provider: string): Promise<number> {
    // 1. プロバイダの存在チェックと連携状態の確認 (OAuthトークン等)
    const integration = await this.userIntegrationRepo.getByProvider(
      userId,
      provider,
    );

    if (!integration?.accessToken) {
      throw new Error(
        `Integration for ${provider} not found or not authorized`,
      );
    }

    if (provider === "github") {
      // GitHubの同期処理
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // コントリビューションデータの取得
      const contributions = await this.githubService.getContributions(
        integration.accessToken,
        integration.providerUserId || "", // GitHubのユーザー名
        thirtyDaysAgo.toISOString(),
        today.toISOString(),
      );

      const activities = contributions.map((day: GithubContributionDay) => ({
        userId,
        provider: "github" as const,
        date: day.date,
        activityCount: day.contributionCount,
        metadata: {
          syncedAt: new Date().toISOString(),
        },
      }));

      // データベースへのUpsert
      await this.externalActivityRepo.upsertActivities(activities);
      return activities.length;
    }

    if (provider === "wakatime") {
      // WakaTimeの同期処理
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // フォーマット: YYYY-MM-DD
      const formatDate = (date: Date) => date.toISOString().split("T")[0];

      const summaries = await this.wakatimeService.getSummaries(
        integration.accessToken,
        formatDate(thirtyDaysAgo),
        formatDate(today),
      );

      const activities = summaries.map((day: WakatimeSummary) => ({
        userId,
        provider: "wakatime" as const,
        date: day.date,
        activityCount: day.totalSeconds, // 秒数を活動量として扱う（将来的に分や時間に変換可能）
        metadata: {
          syncedAt: new Date().toISOString(),
          unit: "seconds",
        },
      }));

      // データベースへのUpsert
      await this.externalActivityRepo.upsertActivities(activities);
      return activities.length;
    }

    throw new Error(`Provider ${provider} sync is not implemented yet`);
  }
}
