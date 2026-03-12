import type { SaveRoadmapRequest } from "../../../../schema/roadmap";
import type { RoadmapRepository } from "../../interfaces/roadmapRepository";

/**
 * ロードマップ保存のビジネスロジックを実行するユースケース
 * LLMで生成されたロードマップを編集後にDBへ保存します。
 */
export class SaveRoadmapUsecase {
  constructor(private readonly roadmapRepository: RoadmapRepository) {}

  /**
   * ロードマップを保存します。
   *
   * @param userId - ロードマップを保存するユーザーのID
   * @param input - 保存するロードマップデータ
   * @returns 作成されたロードマップのID
   */
  async execute(userId: string, input: SaveRoadmapRequest): Promise<string> {
    const roadmapId = await this.roadmapRepository.create({
      userId,
      currentState: input.currentState,
      goalState: input.goalState,
      pdfContext: input.pdfContext ?? null,
      summary: input.summary ?? null,
      milestones: input.milestones.map((milestone) => ({
        title: milestone.title,
        description: milestone.description,
        status: "TODO" as const,
        orderIndex: milestone.orderIndex,
        tasks: milestone.tasks.map((task) => ({
          title: task.title,
          estimatedHours: task.estimatedHours,
          status: "TODO" as const,
          orderIndex: task.orderIndex,
        })),
      })),
    });

    return roadmapId;
  }
}
