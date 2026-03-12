import { DomainError } from "../../../domain/errors";
import type { ActivityLog } from "../../../domain/models/activity";
import type { ActivityLogRepository } from "../../interfaces/activityLogRepository";

/**
 * 活動記録が見つからない場合のエラー
 */
export class ActivityLogNotFoundError extends DomainError {
  constructor() {
    super("Activity log not found");
  }
}

/**
 * 活動記録へのアクセスが許可されていない場合のエラー
 */
export class ActivityLogAccessDeniedError extends DomainError {
  constructor() {
    super("Access denied to this activity log");
  }
}

/**
 * タスクに紐づく活動記録一覧を取得するユースケース
 */
export class GetActivityLogsUsecase {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  /**
   * タスクIDに紐づく活動記録を日時降順で取得します。
   *
   * @param taskId - 取得対象のタスクID
   * @returns 活動記録の配列
   */
  async execute(taskId: string): Promise<ActivityLog[]> {
    return this.activityLogRepository.findByTaskId(taskId);
  }
}
