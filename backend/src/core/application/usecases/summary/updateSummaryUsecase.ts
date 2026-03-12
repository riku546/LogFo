import type { SummaryRepository } from "../../interfaces/summaryRepository";
import {
  SummaryAccessDeniedError,
  SummaryNotFoundError,
} from "./getSummariesUsecase";

/**
 * サマリーのタイトルと内容を更新するユースケース
 */
export class UpdateSummaryUsecase {
  constructor(private readonly summaryRepository: SummaryRepository) {}

  /**
   * 所有権を確認した上でサマリーを更新します。
   *
   * @param summaryId - 更新するサマリーのID
   * @param userId - 操作ユーザーのID
   * @param title - 更新後のタイトル
   * @param content - 更新後のMarkdownテキスト
   * @throws {SummaryNotFoundError} サマリーが存在しない場合
   * @throws {SummaryAccessDeniedError} 所有権がない場合
   */
  async execute(
    summaryId: string,
    userId: string,
    title: string,
    content: string,
  ): Promise<void> {
    const summary = await this.summaryRepository.findById(summaryId);
    if (!summary) {
      throw new SummaryNotFoundError(summaryId);
    }

    const isOwner = await this.summaryRepository.isOwner(summaryId, userId);
    if (!isOwner) {
      throw new SummaryAccessDeniedError(summaryId);
    }

    await this.summaryRepository.update(summaryId, title, content);
  }
}
