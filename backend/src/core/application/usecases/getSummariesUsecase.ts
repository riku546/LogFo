import type { Summary } from "../../domain/models/summary";
import type { SummaryRepository } from "../interfaces/summaryRepository";

/**
 * マイルストーンに紐づくサマリー一覧を取得するユースケース
 */
export class GetSummariesUsecase {
  constructor(private readonly summaryRepository: SummaryRepository) {}

  /**
   * マイルストーンIDに紐づくサマリー一覧を返します。
   *
   * @param milestoneId - マイルストーンのID
   * @returns サマリーの配列
   */
  async execute(milestoneId: string): Promise<Summary[]> {
    return this.summaryRepository.findByMilestoneId(milestoneId);
  }
}

/**
 * サマリーが見つからない場合のエラー
 */
export class SummaryNotFoundError extends Error {
  constructor(summaryId: string) {
    super(`サマリー（${summaryId}）が見つかりません`);
    this.name = "SummaryNotFoundError";
  }
}

/**
 * サマリーへのアクセス権限がない場合のエラー
 */
export class SummaryAccessDeniedError extends Error {
  constructor(summaryId: string) {
    super(`サマリー（${summaryId}）へのアクセスが拒否されました`);
    this.name = "SummaryAccessDeniedError";
  }
}
