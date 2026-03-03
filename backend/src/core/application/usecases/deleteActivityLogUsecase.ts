import type { ActivityLogRepository } from "../interfaces/activityLogRepository";
import {
  ActivityLogAccessDeniedError,
  ActivityLogNotFoundError,
} from "./getActivityLogsUsecase";

/**
 * 活動記録の削除を実行するユースケース
 */
export class DeleteActivityLogUsecase {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  /**
   * 活動記録を削除します。
   *
   * @param activityLogId - 削除する活動記録のID
   * @param userId - リクエストしたユーザーのID
   * @throws {ActivityLogNotFoundError} 活動記録が存在しない場合
   * @throws {ActivityLogAccessDeniedError} ユーザーがオーナーでない場合
   */
  async execute(activityLogId: string, userId: string): Promise<void> {
    const activityLog =
      await this.activityLogRepository.findById(activityLogId);
    if (!activityLog) {
      throw new ActivityLogNotFoundError();
    }

    const isOwner = await this.activityLogRepository.isOwner(
      activityLogId,
      userId,
    );
    if (!isOwner) {
      throw new ActivityLogAccessDeniedError();
    }

    await this.activityLogRepository.delete(activityLogId);
  }
}
