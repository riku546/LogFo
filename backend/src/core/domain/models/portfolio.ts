import type { PortfolioSettings } from "./portfolioSettings";

/**
 * ポートフォリオエンティティの型定義
 * 外部へ公開するポートフォリオの設定を表現します。
 * 1ユーザーにつき1ポートフォリオの制約があります。
 */
export interface Portfolio {
  readonly id: string;
  readonly userId: string;
  readonly slug: string;
  readonly isPublic: boolean;
  readonly settings: PortfolioSettings | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
