import type { PortfolioSettings } from "../../../../schema/portfolio";
import type { PortfolioRepository } from "../../interfaces/portfolioRepository";

/**
 * ポートフォリオが非公開の場合のエラー
 */
export class PortfolioNotPublicError extends Error {
  constructor() {
    super("このポートフォリオは非公開です");
    this.name = "PortfolioNotPublicError";
  }
}

/**
 * ポートフォリオが見つからない場合のエラー
 */
export class PortfolioNotFoundError extends Error {
  constructor() {
    super("ポートフォリオが見つかりません");
    this.name = "PortfolioNotFoundError";
  }
}

/**
 * 公開ポートフォリオの返却データ型
 */
export interface PublicPortfolioData {
  readonly slug: string;
  readonly settings: PortfolioSettings;
}

/**
 * 公開ポートフォリオをSlugで取得するユースケース
 * 公開ページに必要な settings を返却します。
 */
export class GetPublicPortfolioUsecase {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

  /**
   * Slugで公開ポートフォリオを取得します。
   *
   * @param slug - ポートフォリオのSlug
   * @returns 公開ポートフォリオデータ
   * @throws {PortfolioNotFoundError} 該当Slugのポートフォリオが存在しない場合
   * @throws {PortfolioNotPublicError} ポートフォリオが非公開の場合
   */
  async execute(slug: string): Promise<PublicPortfolioData> {
    const portfolio = await this.portfolioRepository.findBySlug(slug);

    if (!portfolio) {
      throw new PortfolioNotFoundError();
    }

    if (!portfolio.isPublic) {
      throw new PortfolioNotPublicError();
    }

    const settings = portfolio.settings;
    if (!settings) {
      throw new PortfolioNotFoundError();
    }

    return {
      slug: portfolio.slug,
      settings,
    };
  }
}
