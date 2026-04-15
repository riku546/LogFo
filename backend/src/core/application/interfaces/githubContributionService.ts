/**
 * GitHub の日別コントリビューション情報
 */
export interface GithubContributionDay {
  date: string;
  contributionCount: number;
}

/**
 * GitHub から外部活動データを取得するサービス
 */
export interface GithubContributionService {
  /**
   * 指定期間のコントリビューション一覧を取得します。
   *
   * @param accessToken - GitHub アクセストークン
   * @param userName - GitHub ユーザー名
   * @param from - 取得開始日時の ISO8601 文字列
   * @param to - 取得終了日時の ISO8601 文字列
   * @returns 日別コントリビューション一覧
   */
  getContributions(
    accessToken: string,
    userName: string,
    from: string,
    to: string,
  ): Promise<GithubContributionDay[]>;
}
