import { z } from "zod";

// ===== ポートフォリオ設定のZodスキーマ =====

/**
 * SNSリンクのスキーマ
 */
export const socialLinksSchema = z.object({
  github: z.string().url().optional().or(z.literal("")),
  x: z.string().url().optional().or(z.literal("")),
  zenn: z.string().url().optional().or(z.literal("")),
  qiita: z.string().url().optional().or(z.literal("")),
  atcoder: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

/**
 * 経歴ストーリーのスキーマ
 */
export const careerStorySchema = z.object({
  id: z.string().min(1),
  title: z.string().optional().default(""),
  organization: z.string().optional().default(""),
  periodFrom: z.string().optional().default(""),
  periodTo: z.string().optional().default(""),
  isCurrent: z.boolean().optional().default(false),
  story: z.string().optional().default(""),
});

/**
 * プロフィール設定スキーマ（常に表示される）
 */
export const profileSettingsSchema = z.object({
  displayName: z.string().min(1, "表示名は必須です"),
  bio: z.string().optional().default(""),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  socialLinks: socialLinksSchema.optional().default({}),
  careerStories: z.array(careerStorySchema).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
});

/**
 * セクション表示設定スキーマ（ID配列で表示対象を指定）
 */
export const sectionSettingsSchema = z.object({
  roadmapIds: z.array(z.string()).optional().default([]),
  summaryIds: z.array(z.string()).optional().default([]),
});

/**
 * ポートフォリオ設定全体のスキーマ
 */
export const portfolioSettingsSchema = z.object({
  profile: profileSettingsSchema,
  sections: sectionSettingsSchema
    .optional()
    .default({ roadmapIds: [], summaryIds: [] }),
});

/**
 * ポートフォリオ設定型
 */
export type PortfolioSettings = z.infer<typeof portfolioSettingsSchema>;

/**
 * ポートフォリオ保存APIのリクエストスキーマ（UPSERT）
 */
export const savePortfolioRequestSchema = z.object({
  slug: z
    .string()
    .min(1, "スラッグは必須です")
    .max(50, "スラッグは50文字以内です")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
      "スラッグは英小文字・数字・ハイフンのみ使用可能です（先頭と末尾にハイフン不可）",
    ),
  isPublic: z.boolean().default(false),
  settings: portfolioSettingsSchema,
});

/**
 * ポートフォリオ保存APIのリクエスト型
 */
export type SavePortfolioRequest = z.infer<typeof savePortfolioRequestSchema>;
