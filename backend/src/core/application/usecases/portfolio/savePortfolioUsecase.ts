import type {
  PortfolioRepository,
  UpsertPortfolioInput,
} from "../../interfaces/portfolioRepository";

/**
 * Slugが既に他のユーザーに使用されている場合のエラー
 */
export class SlugAlreadyTakenError extends Error {
  constructor(slug: string) {
    super(`スラッグ "${slug}" は既に使用されています`);
    this.name = "SlugAlreadyTakenError";
  }
}

/**
 * ポートフォリオ設定をUPSERT（新規作成または更新）するユースケース
 */
export class SavePortfolioUsecase {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

  /**
   * ポートフォリオ設定を保存します。
   * Slug一意性チェックを行い、競合がなければUPSERTを実行します。
   *
   * @param input - ポートフォリオ作成・更新データ
   * @returns 作成または更新されたポートフォリオのID
   * @throws {SlugAlreadyTakenError} Slugが他のユーザーに使用されている場合
   */
  async execute(input: UpsertPortfolioInput): Promise<string> {
    const isAvailable = await this.portfolioRepository.isSlugAvailable(
      input.slug,
      input.userId,
    );

    if (!isAvailable) {
      throw new SlugAlreadyTakenError(input.slug);
    }

    return this.portfolioRepository.upsert(input);
  }
}
