import type { SummaryRepository } from "../interfaces/summaryRepository";
import {
  SummaryAccessDeniedError,
  SummaryNotFoundError,
} from "./getSummariesUsecase";

/**
 * サマリーを削除するユースケース
 */
export class DeleteSummaryUsecase {
  constructor(private readonly summaryRepository: SummaryRepository) {}

  /**
   * 所有権を確認した上でサマリーを削除します。
   *
   * @param summaryId - 削除するサマリーのID
   * @param userId - 操作ユーザーのID
   * @throws {SummaryNotFoundError} サマリーが存在しない場合
   * @throws {SummaryAccessDeniedError} 所有権がない場合
   */
  async execute(summaryId: string, userId: string): Promise<void> {
    const summary = await this.summaryRepository.findById(summaryId);
    if (!summary) {
      throw new SummaryNotFoundError(summaryId);
    }

    const isOwner = await this.summaryRepository.isOwner(summaryId, userId);
    if (!isOwner) {
      throw new SummaryAccessDeniedError(summaryId);
    }

    await this.summaryRepository.delete(summaryId);
  }
}
