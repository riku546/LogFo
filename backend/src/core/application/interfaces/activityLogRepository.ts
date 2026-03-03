import type { ActivityLog } from "../../domain/models/activity";

/**
 * 活動記録作成時の入力データ
 */
export interface CreateActivityLogInput {
  readonly userId: string;
  readonly taskId: string;
  readonly content: string;
  readonly loggedDate: string;
}

/**
 * 活動記録データの永続化操作を定義するリポジトリインターフェース
 */
export interface ActivityLogRepository {
  /**
   * 活動記録を新規作成します。
   *
   * @param input - 活動記録作成に必要なデータ
   * @returns 作成された活動記録のID
   */
  create(input: CreateActivityLogInput): Promise<string>;

  /**
   * タスクIDに紐づく活動記録を日時降順で取得します。
   *
   * @param taskId - タスクのID
   * @returns 活動記録の配列
   */
  findByTaskId(taskId: string): Promise<ActivityLog[]>;

  /**
   * IDで活動記録を1件取得します。
   *
   * @param activityLogId - 活動記録のID
   * @returns 活動記録データ、存在しない場合はundefined
   */
  findById(activityLogId: string): Promise<ActivityLog | undefined>;

  /**
   * 活動記録の内容を更新します。
   *
   * @param activityLogId - 更新する活動記録のID
   * @param content - 更新後のMarkdownテキスト
   */
  update(activityLogId: string, content: string): Promise<void>;

  /**
   * 活動記録を削除します。
   *
   * @param activityLogId - 削除する活動記録のID
   */
  delete(activityLogId: string): Promise<void>;

  /**
   * 活動記録の所有者を確認します。
   *
   * @param activityLogId - 活動記録のID
   * @param userId - ユーザーID
   * @returns ユーザーがオーナーの場合true
   */
  isOwner(activityLogId: string, userId: string): Promise<boolean>;
}
