/**
 * サマリー一覧・詳細表示で共通利用するサマリー情報
 */
export interface SummaryItem {
  id: string;
  userId: string;
  milestoneId: string;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}
