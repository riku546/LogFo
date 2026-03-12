import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type {
  CreateRoadmapInput,
  RoadmapRepository,
} from "../../core/application/interfaces/roadmapRepository";
import type {
  MilestoneWithTasks,
  Roadmap,
  Roadmap as RoadmapModel,
  RoadmapWithMilestones,
  Task,
} from "../../core/domain/models/roadmap";
import { milestones, roadmaps, tasks } from "../database/schema";

/**
 * Drizzle ORMを使用したRoadmapRepositoryの具体実装
 * roadmaps, milestones, tasks テーブルに対するCRUD操作を行います。
 */
export class DrizzleRoadmapRepository implements RoadmapRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  /**
   * ロードマップを新規作成し、マイルストーン・タスクも一括挿入します。
   *
   * @param input - ロードマップ作成データ
   * @returns 作成されたロードマップのID
   */
  async create(input: CreateRoadmapInput): Promise<string> {
    const roadmapId = crypto.randomUUID();

    await this.db.batch([
      this.db.insert(roadmaps).values({
        id: roadmapId,
        userId: input.userId,
        currentState: input.currentState,
        goalState: input.goalState,
        pdfContext: input.pdfContext,
        summary: input.summary,
      }),
      ...input.milestones.flatMap((milestone) => {
        const milestoneId = crypto.randomUUID();
        return [
          this.db.insert(milestones).values({
            id: milestoneId,
            roadmapId,
            title: milestone.title,
            description: milestone.description,
            status: milestone.status,
            orderIndex: milestone.orderIndex,
          }),
          ...milestone.tasks.map((task) =>
            this.db.insert(tasks).values({
              id: crypto.randomUUID(),
              milestoneId,
              title: task.title,
              estimatedHours: task.estimatedHours,
              status: task.status,
              orderIndex: task.orderIndex,
            }),
          ),
        ];
      }),
    ]);

    return roadmapId;
  }

  /**
   * IDでロードマップを取得し、マイルストーン・タスクを集約して返します。
   *
   * @param roadmapId - 取得するロードマップのID
   * @returns ロードマップの完全な集約データ
   */
  async findById(
    roadmapId: string,
  ): Promise<RoadmapWithMilestones | undefined> {
    const roadmapRows = await this.db
      .select()
      .from(roadmaps)
      .where(eq(roadmaps.id, roadmapId));

    const roadmapRow = roadmapRows[0];
    if (!roadmapRow) return undefined;

    const milestoneRows = await this.db
      .select()
      .from(milestones)
      .where(eq(milestones.roadmapId, roadmapId));

    const milestoneIds = milestoneRows.map((milestone) => milestone.id);

    // マイルストーンが0件の場合、タスク取得をスキップ
    let taskRows: (typeof tasks.$inferSelect)[] = [];
    if (milestoneIds.length > 0) {
      // N+1を回避: 全マイルストーンのタスクを一括取得
      const taskPromises = milestoneIds.map((milestoneId) =>
        this.db.select().from(tasks).where(eq(tasks.milestoneId, milestoneId)),
      );
      const taskResults = await Promise.all(taskPromises);
      taskRows = taskResults.flat();
    }

    // タスクをマイルストーンIDでグルーピング
    const tasksByMilestoneId = new Map<string, (typeof tasks.$inferSelect)[]>();
    for (const task of taskRows) {
      const existing = tasksByMilestoneId.get(task.milestoneId) || [];
      existing.push(task);
      tasksByMilestoneId.set(task.milestoneId, existing);
    }

    const roadmap: RoadmapModel = {
      id: roadmapRow.id,
      userId: roadmapRow.userId,
      currentState: roadmapRow.currentState,
      goalState: roadmapRow.goalState,
      pdfContext: roadmapRow.pdfContext,
      summary: roadmapRow.summary,
      createdAt: roadmapRow.createdAt,
      updatedAt: roadmapRow.updatedAt,
    };

    const roadmapMilestones: MilestoneWithTasks[] = milestoneRows
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((milestone) => {
        const milestoneTasks: Task[] = (
          tasksByMilestoneId.get(milestone.id) || []
        )
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((task) => ({
            id: task.id,
            milestoneId: task.milestoneId,
            title: task.title,
            estimatedHours: task.estimatedHours,
            status: task.status,
            orderIndex: task.orderIndex,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          }));

        return {
          id: milestone.id,
          roadmapId: milestone.roadmapId,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          orderIndex: milestone.orderIndex,
          createdAt: milestone.createdAt,
          updatedAt: milestone.updatedAt,
          tasks: milestoneTasks,
        };
      });

    return {
      ...roadmap,
      milestones: roadmapMilestones,
    };
  }

  /**
   * ユーザーのロードマップ一覧を取得します（マイルストーン・タスクは含まない）。
   *
   * @param userId - ユーザーID
   * @returns ロードマップの配列
   */
  async findByUserId(userId: string): Promise<Roadmap[]> {
    const rows = await this.db
      .select()
      .from(roadmaps)
      .where(eq(roadmaps.userId, userId));

    return rows;
  }

  /**
   * ロードマップを更新します（全量置換方式）。
   * 既存のマイルストーン・タスクはカスケード削除され、新しいデータが挿入されます。
   *
   * @param roadmapId - 更新するロードマップのID
   * @param input - 更新データ
   */
  async update(roadmapId: string, input: CreateRoadmapInput): Promise<void> {
    // マイルストーンを削除（タスクもカスケード削除される）
    await this.db.delete(milestones).where(eq(milestones.roadmapId, roadmapId));

    await this.db.batch([
      this.db
        .update(roadmaps)
        .set({
          currentState: input.currentState,
          goalState: input.goalState,
          pdfContext: input.pdfContext,
          summary: input.summary,
          updatedAt: new Date(),
        })
        .where(eq(roadmaps.id, roadmapId)),
      ...input.milestones.flatMap((milestone) => {
        const milestoneId = crypto.randomUUID();
        return [
          this.db.insert(milestones).values({
            id: milestoneId,
            roadmapId,
            title: milestone.title,
            description: milestone.description,
            status: milestone.status,
            orderIndex: milestone.orderIndex,
          }),
          ...milestone.tasks.map((task) =>
            this.db.insert(tasks).values({
              id: crypto.randomUUID(),
              milestoneId,
              title: task.title,
              estimatedHours: task.estimatedHours,
              status: task.status,
              orderIndex: task.orderIndex,
            }),
          ),
        ];
      }),
    ]);
  }

  /**
   * ロードマップを削除します（マイルストーン・タスクもカスケード削除）。
   *
   * @param roadmapId - 削除するロードマップのID
   */
  async delete(roadmapId: string): Promise<void> {
    await this.db.delete(roadmaps).where(eq(roadmaps.id, roadmapId));
  }

  /**
   * ロードマップの所有者を確認します。
   *
   * @param roadmapId - ロードマップのID
   * @param userId - ユーザーID
   * @returns ユーザーがオーナーの場合true
   */
  async isOwner(roadmapId: string, userId: string): Promise<boolean> {
    const rows = await this.db
      .select({ userId: roadmaps.userId })
      .from(roadmaps)
      .where(eq(roadmaps.id, roadmapId));

    return rows[0]?.userId === userId;
  }
}
