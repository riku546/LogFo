import type { UserIntegration } from "../../domain/models/userIntegration";

export interface UserIntegrationRepository {
  /**
   * ユーザーの特定のプロバイダ設定を取得する
   */
  getByProvider(
    userId: string,
    provider: string,
  ): Promise<UserIntegration | null>;

  /**
   * ユーザーのすべてのプロバイダ設定を取得する
   */
  getAllByUserId(userId: string): Promise<UserIntegration[]>;

  /**
   * 連携設定を保存または更新する
   */
  upsertIntegration(
    integration: Omit<UserIntegration, "id" | "createdAt" | "updatedAt">,
  ): Promise<UserIntegration>;
}
