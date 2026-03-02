import { DomainError } from "../../domain/errors";
import type { RoadmapWithMilestones } from "../../domain/models/roadmap";
import type { RoadmapRepository } from "../interfaces/roadmapRepository";

/**
 * ロードマップが見つからない場合のエラー
 */
export class RoadmapNotFoundError extends DomainError {
  constructor() {
    super("Roadmap not found");
  }
}

/**
 * ロードマップへのアクセスが許可されていない場合のエラー
 */
export class RoadmapAccessDeniedError extends DomainError {
  constructor() {
    super("Access denied to this roadmap");
  }
}

/**
 * ロードマップ取得のビジネスロジックを実行するユースケース
 */
export class GetRoadmapUsecase {
  constructor(private readonly roadmapRepository: RoadmapRepository) {}

  /**
   * 指定IDのロードマップを取得します。
   *
   * @param roadmapId - 取得するロードマップのID
   * @param userId - リクエストしたユーザーのID
   * @returns ロードマップの完全な集約データ
   * @throws {RoadmapNotFoundError} ロードマップが存在しない場合
   * @throws {RoadmapAccessDeniedError} ユーザーがオーナーでない場合
   */
  async execute(
    roadmapId: string,
    userId: string,
  ): Promise<RoadmapWithMilestones> {
    const isOwner = await this.roadmapRepository.isOwner(roadmapId, userId);
    if (!isOwner) {
      // ロードマップが存在しないか、オーナーでないかの区別は意図的にしない（セキュリティ）
      const roadmap = await this.roadmapRepository.findById(roadmapId);
      if (!roadmap) {
        throw new RoadmapNotFoundError();
      }
      throw new RoadmapAccessDeniedError();
    }

    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      throw new RoadmapNotFoundError();
    }

    return roadmap;
  }
}
