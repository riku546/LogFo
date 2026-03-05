import { z } from "zod";

/**
 * サマリー生成の出力フォーマット定義
 * LLMプロンプトの文体を切り替えるために使用します。
 */
export const summaryFormatEnum = [
  "self_pr",
  "monthly_report",
  "casual_review",
] as const;

/**
 * サマリー生成の出力フォーマット型
 */
export type SummaryFormatType = (typeof summaryFormatEnum)[number];

/**
 * サマリー生成APIのリクエストスキーマ
 */
export const generateSummaryRequestSchema = z.object({
  milestoneId: z.string().min(1, "マイルストーンIDは必須です"),
  format: z.enum(summaryFormatEnum, {
    message:
      "フォーマットはself_pr, monthly_report, casual_reviewのいずれかです",
  }),
});

/**
 * サマリー生成APIのリクエスト型
 */
export type GenerateSummaryRequest = z.infer<
  typeof generateSummaryRequestSchema
>;

/**
 * サマリー保存APIのリクエストスキーマ
 */
export const saveSummaryRequestSchema = z.object({
  milestoneId: z.string().min(1, "マイルストーンIDは必須です"),
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "サマリー内容を入力してください"),
});

/**
 * サマリー保存APIのリクエスト型
 */
export type SaveSummaryRequest = z.infer<typeof saveSummaryRequestSchema>;

/**
 * サマリー更新APIのリクエストスキーマ
 */
export const updateSummaryRequestSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "サマリー内容を入力してください"),
});

/**
 * サマリー更新APIのリクエスト型
 */
export type UpdateSummaryRequest = z.infer<typeof updateSummaryRequestSchema>;
