/**
 * WakaTime の日別サマリー
 */
export interface WakatimeSummary {
  date: string;
  totalSeconds: number;
}

/**
 * WakaTime から外部活動データを取得するサービス
 */
export interface WakatimeSummaryService {
  /**
   * 指定期間の日別サマリーを取得します。
   *
   * @param accessToken - WakaTime アクセストークン
   * @param start - 取得開始日 (YYYY-MM-DD)
   * @param end - 取得終了日 (YYYY-MM-DD)
   * @returns 日別サマリー一覧
   */
  getSummaries(
    accessToken: string,
    start: string,
    end: string,
  ): Promise<WakatimeSummary[]>;
}
