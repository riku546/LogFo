import type { SummaryItem } from "../../summary/api/summaryApi";

/**
 * cross-feature import が検出されることを確認するフィクスチャ
 */
export const summarySelectionModalFixture = (
  summary: SummaryItem,
): string | null => {
  return summary.title;
};
