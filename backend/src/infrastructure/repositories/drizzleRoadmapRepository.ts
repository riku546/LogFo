import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type {
  CreateRoadmapInput,
  RoadmapRepository,
} from "../../core/application/interfaces/roadmapRepository";
import type {
  MilestoneWithTasks,
  Roadmap,
  RoadmapWithMilestones,
  Task,
} from "../../core/domain/models/roadmap";
import { milestones, roadmaps, tasks } from "../database/schema";

type DatabaseTimestampValue = string | number | Date | null;

interface RawRoadmapRow {
  id: string;
  userId: string;
  currentState: string;
  goalState: string;
  pdfContext: string | null;
  summary: string | null;
  createdAtRaw: string | null;
  updatedAtRaw: string | null;
}

interface RawMilestoneRow {
  id: string;
  roadmapId: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  orderIndex: number;
  createdAtRaw: string | null;
  updatedAtRaw: string | null;
}

interface RawTaskRow {
  id: string;
  milestoneId: string;
  title: string;
  estimatedHours: number | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  orderIndex: number;
  createdAtRaw: string | null;
  updatedAtRaw: string | null;
}

/**
 * Unix秒/ミリ秒タイムスタンプを Date に変換します。
 *
 * @param timestampValue - 数値タイムスタンプ
 * @returns 変換後の Date
 */
const buildDateFromTimestampValue = (timestampValue: number): Date =>
  new Date(
    timestampValue < 1_000_000_000_000 ? timestampValue * 1000 : timestampValue,
  );

/**
 * 数値文字列タイムスタンプを Date に変換します。
 *
 * @param timestampText - 数値形式の時刻文字列
 * @returns 変換後の Date
 */
const parseNumericTimestampText = (timestampText: string): Date =>
  buildDateFromTimestampValue(Number(timestampText));

/**
 * SQLite の日時文字列を Date に変換します。
 *
 * @param timestampText - `YYYY-MM-DD HH:mm:ss` または `YYYY-MM-DD`
 * @returns 変換後の Date、該当しない場合は `null`
 */
const parseSqliteTimestampText = (timestampText: string): Date | null => {
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestampText)) {
    return new Date(timestampText.replace(" ", "T").concat("Z"));
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(timestampText)) {
    return new Date(`${timestampText}T00:00:00Z`);
  }

  return null;
};

/**
 * 文字列形式の時刻値を Date に変換します。
 *
 * @param timestampValue - DB から取得した文字列時刻
 * @returns 変換後の Date
 */
const parseStringTimestampValue = (timestampValue: string): Date => {
  const trimmedTimestampValue = timestampValue.trim();

  if (/^\d+$/.test(trimmedTimestampValue)) {
    return parseNumericTimestampText(trimmedTimestampValue);
  }

  const sqliteTimestamp = parseSqliteTimestampText(trimmedTimestampValue);
  return sqliteTimestamp ?? new Date(trimmedTimestampValue);
};

/**
 * D1 から取得した時刻値を Date に正規化します。
 * 既存データの SQLite 文字列形式と、今後入りうる Unix タイムスタンプの両方を扱います。
 *
 * @param timestampValue - DB から取得した生の時刻値
 * @returns 正規化済みの Date
 */
const normalizeDatabaseTimestamp = (
  timestampValue: DatabaseTimestampValue,
): Date => {
  if (timestampValue instanceof Date) {
    return timestampValue;
  }

  if (typeof timestampValue === "number") {
    return buildDateFromTimestampValue(timestampValue);
  }

  if (typeof timestampValue === "string") {
    return parseStringTimestampValue(timestampValue);
  }

  return new Date(0);
};

/**
 * ロードマップの生レコードをドメインモデルへ変換します。
 *
 * @param rawRoadmapRow - SQL から取得したロードマップ行
 * @returns ドメイン用に正規化したロードマップ
 */
const toRoadmap = (rawRoadmapRow: RawRoadmapRow): Roadmap => ({
  id: rawRoadmapRow.id,
  userId: rawRoadmapRow.userId,
  currentState: rawRoadmapRow.currentState,
  goalState: rawRoadmapRow.goalState,
  pdfContext: rawRoadmapRow.pdfContext,
  summary: rawRoadmapRow.summary,
  createdAt: normalizeDatabaseTimestamp(rawRoadmapRow.createdAtRaw),
  updatedAt: normalizeDatabaseTimestamp(rawRoadmapRow.updatedAtRaw),
});

/**
 * マイルストーンの生レコードをドメインモデルへ変換します。
 *
 * @param rawMilestoneRow - SQL から取得したマイルストーン行
 * @param milestoneTasks - 当該マイルストーンに属するタスク一覧
 * @returns ドメイン用に正規化したマイルストーン
 */
const toMilestoneWithTasks = (
  rawMilestoneRow: RawMilestoneRow,
  milestoneTasks: Task[],
): MilestoneWithTasks => ({
  id: rawMilestoneRow.id,
  roadmapId: rawMilestoneRow.roadmapId,
  title: rawMilestoneRow.title,
  description: rawMilestoneRow.description,
  status: rawMilestoneRow.status,
  orderIndex: rawMilestoneRow.orderIndex,
  createdAt: normalizeDatabaseTimestamp(rawMilestoneRow.createdAtRaw),
  updatedAt: normalizeDatabaseTimestamp(rawMilestoneRow.updatedAtRaw),
  tasks: milestoneTasks,
});

/**
 * タスクの生レコードをドメインモデルへ変換します。
 *
 * @param rawTaskRow - SQL から取得したタスク行
 * @returns ドメイン用に正規化したタスク
 */
const toTask = (rawTaskRow: RawTaskRow): Task => ({
  id: rawTaskRow.id,
  milestoneId: rawTaskRow.milestoneId,
  title: rawTaskRow.title,
  estimatedHours: rawTaskRow.estimatedHours,
  status: rawTaskRow.status,
  orderIndex: rawTaskRow.orderIndex,
  createdAt: normalizeDatabaseTimestamp(rawTaskRow.createdAtRaw),
  updatedAt: normalizeDatabaseTimestamp(rawTaskRow.updatedAtRaw),
});

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
      .select({
        id: roadmaps.id,
        userId: roadmaps.userId,
        currentState: roadmaps.currentState,
        goalState: roadmaps.goalState,
        pdfContext: roadmaps.pdfContext,
        summary: roadmaps.summary,
        createdAtRaw: sql<string | null>`CAST(${roadmaps.createdAt} AS TEXT)`,
        updatedAtRaw: sql<string | null>`CAST(${roadmaps.updatedAt} AS TEXT)`,
      })
      .from(roadmaps)
      .where(eq(roadmaps.id, roadmapId));

    const roadmapRow = roadmapRows[0];
    if (!roadmapRow) return undefined;

    const milestoneRows = await this.db
      .select({
        id: milestones.id,
        roadmapId: milestones.roadmapId,
        title: milestones.title,
        description: milestones.description,
        status: milestones.status,
        orderIndex: milestones.orderIndex,
        createdAtRaw: sql<string | null>`CAST(${milestones.createdAt} AS TEXT)`,
        updatedAtRaw: sql<string | null>`CAST(${milestones.updatedAt} AS TEXT)`,
      })
      .from(milestones)
      .where(eq(milestones.roadmapId, roadmapId));

    const milestoneIds = milestoneRows.map((milestone) => milestone.id);

    // マイルストーンが0件の場合、タスク取得をスキップ
    let taskRows: RawTaskRow[] = [];
    if (milestoneIds.length > 0) {
      // N+1を回避: 全マイルストーンのタスクを一括取得
      const taskPromises = milestoneIds.map((milestoneId) =>
        this.db
          .select({
            id: tasks.id,
            milestoneId: tasks.milestoneId,
            title: tasks.title,
            estimatedHours: tasks.estimatedHours,
            status: tasks.status,
            orderIndex: tasks.orderIndex,
            createdAtRaw: sql<string | null>`CAST(${tasks.createdAt} AS TEXT)`,
            updatedAtRaw: sql<string | null>`CAST(${tasks.updatedAt} AS TEXT)`,
          })
          .from(tasks)
          .where(eq(tasks.milestoneId, milestoneId)),
      );
      const taskResults = await Promise.all(taskPromises);
      taskRows = taskResults.flat();
    }

    // タスクをマイルストーンIDでグルーピング
    const tasksByMilestoneId = new Map<string, RawTaskRow[]>();
    for (const task of taskRows) {
      const existing = tasksByMilestoneId.get(task.milestoneId) || [];
      existing.push(task);
      tasksByMilestoneId.set(task.milestoneId, existing);
    }

    const roadmapMilestones: MilestoneWithTasks[] = milestoneRows
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((milestone) => {
        const milestoneTasks: Task[] = (
          tasksByMilestoneId.get(milestone.id) || []
        )
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map(toTask);

        return toMilestoneWithTasks(milestone, milestoneTasks);
      });

    return {
      ...toRoadmap(roadmapRow),
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
      .select({
        id: roadmaps.id,
        userId: roadmaps.userId,
        currentState: roadmaps.currentState,
        goalState: roadmaps.goalState,
        pdfContext: roadmaps.pdfContext,
        summary: roadmaps.summary,
        createdAtRaw: sql<string | null>`CAST(${roadmaps.createdAt} AS TEXT)`,
        updatedAtRaw: sql<string | null>`CAST(${roadmaps.updatedAt} AS TEXT)`,
      })
      .from(roadmaps)
      .where(eq(roadmaps.userId, userId));

    return rows.map(toRoadmap);
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
