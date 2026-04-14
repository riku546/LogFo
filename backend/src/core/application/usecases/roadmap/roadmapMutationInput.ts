/**
 * ロードマップ更新時のタスク入力
 */
export interface RoadmapTaskMutationInput {
  title: string;
  estimatedHours: number | null;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  orderIndex: number;
}

/**
 * ロードマップ更新時のマイルストーン入力
 */
export interface RoadmapMilestoneMutationInput {
  title: string;
  description: string | null;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  orderIndex: number;
  tasks: RoadmapTaskMutationInput[];
}

/**
 * ロードマップ保存・更新時の入力
 */
export interface RoadmapMutationInput {
  currentState: string;
  goalState: string;
  pdfContext?: string | null;
  summary?: string | null;
  milestones: RoadmapMilestoneMutationInput[];
}
