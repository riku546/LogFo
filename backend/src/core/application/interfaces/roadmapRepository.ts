import type {
  Roadmap,
  RoadmapWithMilestones,
} from "../../domain/models/roadmap";

/**
 * ロードマップ保存時のマイルストーン内タスク入力
 */
export interface CreateTaskInput {
  readonly title: string;
  readonly estimatedHours: number | null;
  readonly status: "TODO" | "IN_PROGRESS" | "DONE";
  readonly orderIndex: number;
}

/**
 * ロードマップ保存時のマイルストーン入力
 */
export interface CreateMilestoneInput {
  readonly title: string;
  readonly description: string | null;
  readonly status: "TODO" | "IN_PROGRESS" | "DONE";
  readonly orderIndex: number;
  readonly tasks: CreateTaskInput[];
}

/**
 * ロードマップ作成入力
 */
export interface CreateRoadmapInput {
  readonly userId: string;
  readonly currentState: string;
  readonly goalState: string;
  readonly pdfContext: string | null;
  readonly summary: string | null;
  readonly milestones: CreateMilestoneInput[];
}

/**
 * ロードマップデータの永続化操作を定義するリポジトリインターフェース
 */
export interface RoadmapRepository {
  /**
   * ロードマップを新規作成します（マイルストーン・タスクを含む）。
   *
   * @param input - ロードマップ作成に必要なデータ
   * @returns 作成されたロードマップのID
   */
  create(input: CreateRoadmapInput): Promise<string>;

  /**
   * IDでロードマップを取得します（マイルストーン・タスクを含む）。
   *
   * @param roadmapId - 取得するロードマップのID
   * @returns ロードマップの完全な集約データ、存在しない場合はundefined
   */
  findById(roadmapId: string): Promise<RoadmapWithMilestones | undefined>;

  /**
   * ユーザーのロードマップ一覧を取得します。
   *
   * @param userId - ユーザーID
   * @returns ロードマップの配列（マイルストーン・タスクは含まない）
   */
  findByUserId(userId: string): Promise<Roadmap[]>;

  /**
   * ロードマップを更新します（全量置換: 既存のマイルストーン・タスクを削除して再作成）。
   *
   * @param roadmapId - 更新するロードマップのID
   * @param input - 更新データ
   */
  update(roadmapId: string, input: CreateRoadmapInput): Promise<void>;

  /**
   * ロードマップを削除します。
   *
   * @param roadmapId - 削除するロードマップのID
   */
  delete(roadmapId: string): Promise<void>;

  /**
   * ロードマップの所有者を確認します。
   *
   * @param roadmapId - ロードマップのID
   * @param userId - ユーザーID
   * @returns ユーザーがオーナーの場合true
   */
  isOwner(roadmapId: string, userId: string): Promise<boolean>;
}
