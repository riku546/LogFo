import type { ActivityLog } from "../../../domain/models/activity";
import type { ActivityLogRepository } from "../../interfaces/activityLogRepository";

/**
 * サマリー生成用のデータ抽出結果
 */
export interface SummaryGenerationContext {
  readonly activityLogs: ActivityLog[];
  readonly milestoneId: string;
}

/**
 * サマリー生成に必要なデータを抽出するユースケース
 * マイルストーンに紐づく活動記録を取得し、プロンプト構築用のコンテキストとして返却します。
 */
export class GenerateSummaryUsecase {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  /**
   * マイルストーンIDに紐づく活動記録を取得します。
   *
   * @param milestoneId - 対象マイルストーンのID
   * @returns サマリー生成用のコンテキストデータ
   * @throws {NoActivityLogsError} 活動記録が存在しない場合
   */
  async execute(milestoneId: string): Promise<SummaryGenerationContext> {
    const activityLogs =
      await this.activityLogRepository.findByMilestoneId(milestoneId);

    if (activityLogs.length === 0) {
      throw new NoActivityLogsError(milestoneId);
    }

    return {
      activityLogs,
      milestoneId,
    };
  }
}

/**
 * 活動記録が存在しない場合のエラー
 */
export class NoActivityLogsError extends Error {
  constructor(milestoneId: string) {
    super(`マイルストーン（${milestoneId}）に紐づく活動記録が見つかりません`);
    this.name = "NoActivityLogsError";
  }
}
