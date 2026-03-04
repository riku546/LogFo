import type { ExternalActivity } from "../../domain/models/externalActivity";

export interface ExternalActivityRepository {
  /**
   * 複数件の外部活動データを保存または更新する (Upsert)
   */
  upsertActivities(
    activities: Omit<ExternalActivity, "id" | "createdAt" | "updatedAt">[],
  ): Promise<void>;

  /**
   * 特定のユーザーの外部活動データを期間指定で取得する
   * @param userId ユーザーID
   * @param startDate 取得開始日 (YYYY-MM-DD)
   * @param endDate 取得終了日 (YYYY-MM-DD)
   */
  getActivitiesByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<ExternalActivity[]>;

  /**
   * 特定ユーザーの全外部活動データを取得（統計用）
   */
  getAllActivitiesByUserId(userId: string): Promise<ExternalActivity[]>;
}
