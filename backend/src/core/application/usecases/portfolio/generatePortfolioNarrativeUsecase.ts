import type {
  PortfolioGeneratedContent,
  PortfolioGeneratedSectionKey,
  ProfileSettings,
} from "../../../../schema/portfolio";
import type { Summary } from "../../../domain/models/summary";
import type { SummaryRepository } from "../../interfaces/summaryRepository";

/**
 * ポートフォリオ文章生成の入力データ
 */
export interface GeneratePortfolioNarrativeInput {
  readonly userId: string;
  readonly selectedSummaryIds: string[];
  readonly selfPrDraft: string;
  readonly profile: ProfileSettings;
  readonly currentContent: PortfolioGeneratedContent;
  readonly targetSection?: PortfolioGeneratedSectionKey;
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
  generate(input: {
    profile: ProfileSettings;
    selfPrDraft: string;
    selectedSummaries: Summary[];
    currentContent: PortfolioGeneratedContent;
    targetSection?: PortfolioGeneratedSectionKey;
  }): Promise<PortfolioGeneratedContent>;
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
  ): Promise<PortfolioGeneratedContent> {
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

    const generatedContent = await this.narrativeGenerator.generate({
      profile: input.profile,
      selfPrDraft: input.selfPrDraft,
      selectedSummaries: orderedSummaries,
      currentContent: input.currentContent,
      targetSection: input.targetSection,
    });

    if (!input.targetSection) {
      return generatedContent;
    }

    return {
      ...input.currentContent,
      [input.targetSection]:
        generatedContent[input.targetSection] ||
        input.currentContent[input.targetSection],
    };
  }
}
