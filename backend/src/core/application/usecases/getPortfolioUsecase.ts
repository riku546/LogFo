import type { Portfolio } from "../../domain/models/portfolio";
import type { PortfolioRepository } from "../interfaces/portfolioRepository";

/**
 * ログインユーザー自身のポートフォリオ設定を取得するユースケース
 */
export class GetPortfolioUsecase {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

  /**
   * ユーザーIDでポートフォリオ設定を取得します。
   *
   * @param userId - ユーザーID
   * @returns ポートフォリオデータ、未作成の場合はundefined
   */
  async execute(userId: string): Promise<Portfolio | undefined> {
    return this.portfolioRepository.findByUserId(userId);
  }
}
