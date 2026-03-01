/**
 * タスクのステータスを表すユニオン型
 */
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

/**
 * ロードマップエンティティの型定義
 * ユーザーの現状と目標から生成された学習計画のルートデータです。
 */
export interface Roadmap {
  readonly id: string;
  readonly userId: string;
  readonly currentState: string;
  readonly goalState: string;
  readonly pdfContext: string | null;
  readonly summary: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * マイルストーンエンティティの型定義
 * ロードマップに紐づく中間目標です。
 */
export interface Milestone {
  readonly id: string;
  readonly roadmapId: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly orderIndex: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * タスクエンティティの型定義
 * マイルストーンに紐づく具体的な行動単位です。
 */
export interface Task {
  readonly id: string;
  readonly milestoneId: string;
  readonly title: string;
  readonly estimatedHours: number | null;
  readonly status: TaskStatus;
  readonly orderIndex: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * マイルストーンとその配下のタスクを含む集約型
 */
export interface MilestoneWithTasks extends Milestone {
  readonly tasks: Task[];
}

/**
 * ロードマップの完全な集約型（マイルストーン・タスクを含む）
 */
export interface RoadmapWithMilestones extends Roadmap {
  readonly milestones: MilestoneWithTasks[];
}
