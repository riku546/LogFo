import { and, desc, eq, inArray } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type {
  CreateSummaryInput,
  SummaryRepository,
} from "../../core/application/interfaces/summaryRepository";
import type { Summary } from "../../core/domain/models/summary";
import { summaries } from "../database/schema";

/**
 * Drizzle ORMを使用したSummaryRepositoryの具体実装
 * summaries テーブルに対するCRUD操作を行います。
 */
export class DrizzleSummaryRepository implements SummaryRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  /**
   * サマリーを新規作成します。
   *
   * @param input - サマリー作成データ
   * @returns 作成されたサマリーのID
   */
  async create(input: CreateSummaryInput): Promise<string> {
    const summaryId = crypto.randomUUID();

    await this.db.insert(summaries).values({
      id: summaryId,
      userId: input.userId,
      milestoneId: input.milestoneId,
      title: input.title,
      content: input.content,
    });

    return summaryId;
  }

  /**
   * マイルストーンIDに紐づくサマリーを作成日時降順で取得します。
   *
   * @param milestoneId - マイルストーンのID
   * @returns サマリーの配列
   */
  async findByMilestoneId(milestoneId: string): Promise<Summary[]> {
    const rows = await this.db
      .select()
      .from(summaries)
      .where(eq(summaries.milestoneId, milestoneId))
      .orderBy(desc(summaries.createdAt));

    return rows;
  }

  /**
   * ユーザーIDに紐づくサマリーを作成日時降順で取得します。
   *
   * @param userId - ユーザーID
   * @returns サマリーの配列
   */
  async findByUserId(userId: string): Promise<Summary[]> {
    const rows = await this.db
      .select()
      .from(summaries)
      .where(eq(summaries.userId, userId))
      .orderBy(desc(summaries.createdAt));

    return rows;
  }

  /**
   * IDでサマリーを1件取得します。
   *
   * @param summaryId - サマリーのID
   * @returns サマリーデータ、存在しない場合はundefined
   */
  async findById(summaryId: string): Promise<Summary | undefined> {
    const rows = await this.db
      .select()
      .from(summaries)
      .where(eq(summaries.id, summaryId));

    const row = rows[0];
    if (!row) return undefined;

    return row;
  }

  /**
   * 指定ユーザーが所有するサマリーをID配列で取得します。
   *
   * @param userId - ユーザーID
   * @param summaryIds - サマリーID配列
   * @returns 取得できたサマリー配列
   */
  async findByIdsForUser(
    userId: string,
    summaryIds: string[],
  ): Promise<Summary[]> {
    if (summaryIds.length === 0) return [];

    const rows = await this.db
      .select()
      .from(summaries)
      .where(
        and(eq(summaries.userId, userId), inArray(summaries.id, summaryIds)),
      );

    return rows;
  }

  /**
   * サマリーのタイトルと内容を更新します。
   *
   * @param summaryId - 更新するサマリーのID
   * @param title - 更新後のタイトル
   * @param content - 更新後のMarkdownテキスト
   */
  async update(
    summaryId: string,
    title: string,
    content: string,
  ): Promise<void> {
    await this.db
      .update(summaries)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(eq(summaries.id, summaryId));
  }

  /**
   * サマリーを削除します。
   *
   * @param summaryId - 削除するサマリーのID
   */
  async delete(summaryId: string): Promise<void> {
    await this.db.delete(summaries).where(eq(summaries.id, summaryId));
  }

  /**
   * サマリーの所有者を確認します。
   *
   * @param summaryId - サマリーのID
   * @param userId - ユーザーID
   * @returns ユーザーがオーナーの場合true
   */
  async isOwner(summaryId: string, userId: string): Promise<boolean> {
    const rows = await this.db
      .select({ userId: summaries.userId })
      .from(summaries)
      .where(eq(summaries.id, summaryId));

    return rows[0]?.userId === userId;
  }
}
