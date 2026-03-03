import { desc, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type {
  ActivityLogRepository,
  CreateActivityLogInput,
} from "../../core/application/interfaces/activityLogRepository";
import type { ActivityLog } from "../../core/domain/models/activity";
import { activityLogs } from "../database/schema";

/**
 * Drizzle ORMを使用したActivityLogRepositoryの具体実装
 * activity_logs テーブルに対するCRUD操作を行います。
 */
export class DrizzleActivityLogRepository implements ActivityLogRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  /**
   * 活動記録を新規作成します。
   *
   * @param input - 活動記録作成データ
   * @returns 作成された活動記録のID
   */
  async create(input: CreateActivityLogInput): Promise<string> {
    const activityLogId = crypto.randomUUID();

    await this.db.insert(activityLogs).values({
      id: activityLogId,
      userId: input.userId,
      taskId: input.taskId,
      content: input.content,
      loggedDate: input.loggedDate,
    });

    return activityLogId;
  }

  /**
   * タスクIDに紐づく活動記録を日時降順で取得します。
   *
   * @param taskId - タスクのID
   * @returns 活動記録の配列
   */
  async findByTaskId(taskId: string): Promise<ActivityLog[]> {
    const rows = await this.db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.taskId, taskId))
      .orderBy(desc(activityLogs.loggedDate), desc(activityLogs.createdAt));

    return rows as ActivityLog[];
  }

  /**
   * IDで活動記録を1件取得します。
   *
   * @param activityLogId - 活動記録のID
   * @returns 活動記録データ、存在しない場合はundefined
   */
  async findById(activityLogId: string): Promise<ActivityLog | undefined> {
    const rows = await this.db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.id, activityLogId));

    const row = rows[0];
    if (!row) return undefined;

    return row as ActivityLog;
  }

  /**
   * 活動記録の内容を更新します。
   *
   * @param activityLogId - 更新する活動記録のID
   * @param content - 更新後のMarkdownテキスト
   */
  async update(activityLogId: string, content: string): Promise<void> {
    await this.db
      .update(activityLogs)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(activityLogs.id, activityLogId));
  }

  /**
   * 活動記録を削除します。
   *
   * @param activityLogId - 削除する活動記録のID
   */
  async delete(activityLogId: string): Promise<void> {
    await this.db
      .delete(activityLogs)
      .where(eq(activityLogs.id, activityLogId));
  }

  /**
   * 活動記録の所有者を確認します。
   *
   * @param activityLogId - 活動記録のID
   * @param userId - ユーザーID
   * @returns ユーザーがオーナーの場合true
   */
  async isOwner(activityLogId: string, userId: string): Promise<boolean> {
    const rows = await this.db
      .select({ userId: activityLogs.userId })
      .from(activityLogs)
      .where(eq(activityLogs.id, activityLogId));

    return rows[0]?.userId === userId;
  }
}
