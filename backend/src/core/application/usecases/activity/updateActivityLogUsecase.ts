import type { ActivityLogRepository } from "../../interfaces/activityLogRepository";
import {
  ActivityLogAccessDeniedError,
  ActivityLogNotFoundError,
} from "./getActivityLogsUsecase";

/**
 * 活動記録の更新を実行するユースケース
 */
export class UpdateActivityLogUsecase {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  /**
   * 活動記録の内容を更新します。
   *
   * @param activityLogId - 更新する活動記録のID
   * @param userId - リクエストしたユーザーのID
   * @param content - 更新後のMarkdownテキスト
   * @throws {ActivityLogNotFoundError} 活動記録が存在しない場合
   * @throws {ActivityLogAccessDeniedError} ユーザーがオーナーでない場合
   */
  async execute(
    activityLogId: string,
    userId: string,
    content: string,
  ): Promise<void> {
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

    await this.activityLogRepository.update(activityLogId, content);
  }
}
