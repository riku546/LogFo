import type { TaskStatus } from "./roadmap";

/**
 * 活動記録エンティティの型定義
 * タスクに対する日々の学習内容を記録するデータです。
 */
export interface ActivityLog {
  readonly id: string;
  readonly userId: string;
  readonly taskId: string;
  readonly content: string;
  readonly loggedDate: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type { TaskStatus };
