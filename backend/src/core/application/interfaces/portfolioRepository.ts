import type { Portfolio } from "../../domain/models/portfolio";
import type { PortfolioSettings } from "../../domain/models/portfolioSettings";

/**
 * ポートフォリオ作成・更新時の入力データ
 */
export interface UpsertPortfolioInput {
  readonly userId: string;
  readonly slug: string;
  readonly isPublic: boolean;
  readonly settings: PortfolioSettings;
}

/**
 * ポートフォリオデータの永続化操作を定義するリポジトリインターフェース
 */
export interface PortfolioRepository {
  /**
   * ポートフォリオをUPSERTします。
   * ユーザーIDで既存レコードを検索し、あれば更新、なければ新規作成します。
   *
   * @param input - ポートフォリオ作成・更新データ
   * @returns 作成または更新されたポートフォリオのID
   */
  upsert(input: UpsertPortfolioInput): Promise<string>;

  /**
   * ユーザーIDでポートフォリオを取得します。
   *
   * @param userId - ユーザーのID
   * @returns ポートフォリオデータ、存在しない場合はundefined
   */
  findByUserId(userId: string): Promise<Portfolio | undefined>;

  /**
   * SlugでPublicポートフォリオを取得します。
   *
   * @param slug - ポートフォリオのSlug
   * @returns ポートフォリオデータ、存在しない場合はundefined
   */
  findBySlug(slug: string): Promise<Portfolio | undefined>;

  /**
   * 指定されたSlugが利用可能かチェックします。
   *
   * @param slug - チェック対象のSlug
   * @param excludeUserId - 自分自身のポートフォリオを除外するためのユーザーID（更新時の重複チェック用）
   * @returns 利用可能な場合true
   */
  isSlugAvailable(slug: string, excludeUserId?: string): Promise<boolean>;
}
