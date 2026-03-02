import type { UpdateRoadmapRequest } from "../../../schema/roadmap";
import type { RoadmapRepository } from "../interfaces/roadmapRepository";
import {
  RoadmapAccessDeniedError,
  RoadmapNotFoundError,
} from "./getRoadmapUsecase";

/**
 * ロードマップ更新のビジネスロジックを実行するユースケース
 * フロントエンドでの編集（並び替え、追加、削除）結果をDBに反映します。
 */
export class UpdateRoadmapUsecase {
  constructor(private readonly roadmapRepository: RoadmapRepository) {}

  /**
   * ロードマップを更新します。
   *
   * @param roadmapId - 更新するロードマップのID
   * @param userId - リクエストしたユーザーのID
   * @param input - 更新データ
   * @throws {RoadmapNotFoundError} ロードマップが存在しない場合
   * @throws {RoadmapAccessDeniedError} ユーザーがオーナーでない場合
   */
  async execute(
    roadmapId: string,
    userId: string,
    input: UpdateRoadmapRequest,
  ): Promise<void> {
    const isOwner = await this.roadmapRepository.isOwner(roadmapId, userId);
    if (!isOwner) {
      const roadmap = await this.roadmapRepository.findById(roadmapId);
      if (!roadmap) {
        throw new RoadmapNotFoundError();
      }
      throw new RoadmapAccessDeniedError();
    }

    await this.roadmapRepository.update(roadmapId, {
      userId,
      currentState: input.currentState,
      goalState: input.goalState,
      pdfContext: input.pdfContext ?? null,
      summary: input.summary ?? null,
      milestones: input.milestones.map((milestone) => ({
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        orderIndex: milestone.orderIndex,
        tasks: milestone.tasks.map((task) => ({
          title: task.title,
          estimatedHours: task.estimatedHours,
          status: task.status,
          orderIndex: task.orderIndex,
        })),
      })),
    });
  }
}
