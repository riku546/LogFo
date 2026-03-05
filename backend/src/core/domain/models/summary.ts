/**
 * サマリーエンティティの型定義
 * マイルストーン期間内の活動記録をLLMが分析・要約した自己PR・振り返りテキストです。
 */
export interface Summary {
  readonly id: string;
  readonly userId: string;
  readonly milestoneId: string;
  readonly title: string | null;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
