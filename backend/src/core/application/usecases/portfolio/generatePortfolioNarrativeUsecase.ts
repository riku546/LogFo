import type {
  PortfolioGeneratedContent,
  PortfolioGeneratedSectionKey,
} from "../../../domain/models/portfolioSettings";
import type { Summary } from "../../../domain/models/summary";
import type { SummaryRepository } from "../../interfaces/summaryRepository";

/**
 * ポートフォリオ文章生成の入力データ
 */
export interface GeneratePortfolioNarrativeInput {
  readonly userId: string;
  readonly selectedSummaryIds: string[];
  readonly chatInput: string;
  readonly targetSection: PortfolioGeneratedSectionKey;
  readonly currentContent: PortfolioGeneratedContent;
}

/**
 * ポートフォリオ文章を生成する外部依存インターフェース
 */
export interface PortfolioNarrativeGenerator {
  /**
   * ポートフォリオ文章を生成します。
   *
   * @param input - 生成コンテキスト
   * @returns 4セクションの生成結果
   */
  generateStream(input: {
    chatInput: string;
    targetSection: PortfolioGeneratedSectionKey;
    selectedSummaries: Summary[];
    currentContent: PortfolioGeneratedContent;
  }): AsyncIterable<string>;
}

/**
 * 指定サマリーにアクセスできない場合のエラー
 */
export class SummarySelectionForbiddenError extends Error {
  constructor() {
    super(
      "指定したサマリーにアクセスできません。自分のサマリーのみ選択してください",
    );
    this.name = "SummarySelectionForbiddenError";
  }
}

/**
 * ポートフォリオ文章生成ユースケース
 */
export class GeneratePortfolioNarrativeUsecase {
  constructor(
    private readonly summaryRepository: SummaryRepository,
    private readonly narrativeGenerator: PortfolioNarrativeGenerator,
  ) {}

  /**
   * 入力に応じてポートフォリオ文章を生成します。
   *
   * @param input - 生成入力
   * @returns 生成済み文章
   * @throws {SummarySelectionForbiddenError} 所有していないサマリーIDが含まれる場合
   */
  async execute(
    input: GeneratePortfolioNarrativeInput,
  ): Promise<AsyncIterable<string>> {
    const selectedSummaries = await this.summaryRepository.findByIdsForUser(
      input.userId,
      input.selectedSummaryIds,
    );

    if (selectedSummaries.length !== input.selectedSummaryIds.length) {
      throw new SummarySelectionForbiddenError();
    }

    const summaryById = new Map(
      selectedSummaries.map((summary) => [summary.id, summary]),
    );
    const orderedSummaries = input.selectedSummaryIds
      .map((summaryId) => summaryById.get(summaryId))
      .filter((summary): summary is Summary => summary !== undefined);

    return this.narrativeGenerator.generateStream({
      chatInput: input.chatInput,
      targetSection: input.targetSection,
      selectedSummaries: orderedSummaries,
      currentContent: input.currentContent,
    });
  }
}
