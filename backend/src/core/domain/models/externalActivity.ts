/**
 * 外部サービスから取得した日々の活動記録（ヒートマップ用データ）のエンティティ
 */
export interface ExternalActivity {
  readonly id: string;
  readonly userId: string;
  readonly provider: "github" | "wakatime" | "qiita" | "zenn" | "atcoder";
  readonly date: string; // YYYY-MM-DD
  readonly activityCount: number;
  readonly metadata: unknown | null; // 言語の割合などのJSONデータ
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
