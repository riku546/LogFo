import type { RoadmapRepository } from "../../interfaces/roadmapRepository";
import {
  RoadmapAccessDeniedError,
  RoadmapNotFoundError,
} from "./getRoadmapUsecase";

/**
 * ロードマップ削除のビジネスロジックを実行するユースケース
 */
export class DeleteRoadmapUsecase {
  constructor(private readonly roadmapRepository: RoadmapRepository) {}

  /**
   * ロードマップを削除します。
   *
   * @param roadmapId - 削除するロードマップのID
   * @param userId - リクエストしたユーザーのID
   * @throws {RoadmapNotFoundError} ロードマップが存在しない場合
   * @throws {RoadmapAccessDeniedError} ユーザーがオーナーでない場合
   */
  async execute(roadmapId: string, userId: string): Promise<void> {
    const isOwner = await this.roadmapRepository.isOwner(roadmapId, userId);
    if (!isOwner) {
      const roadmap = await this.roadmapRepository.findById(roadmapId);
      if (!roadmap) {
        throw new RoadmapNotFoundError();
      }
      throw new RoadmapAccessDeniedError();
    }

    await this.roadmapRepository.delete(roadmapId);
  }
}
