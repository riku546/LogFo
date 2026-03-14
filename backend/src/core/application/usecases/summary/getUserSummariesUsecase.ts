import type { Summary } from "../../../domain/models/summary";
import type { SummaryRepository } from "../../interfaces/summaryRepository";

/**
 * ログインユーザーのサマリー一覧を取得するユースケース
 */
export class GetUserSummariesUsecase {
  constructor(private readonly summaryRepository: SummaryRepository) {}

  /**
   * ユーザーIDに紐づくサマリー一覧を返します。
   *
   * @param userId - ログインユーザーID
   * @returns サマリー一覧
   */
  async execute(userId: string): Promise<Summary[]> {
    return this.summaryRepository.findByUserId(userId);
  }
}
