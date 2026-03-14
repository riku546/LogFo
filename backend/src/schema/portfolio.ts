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
 * プロフィール設定型
 */
export type ProfileSettings = z.infer<typeof profileSettingsSchema>;

/**
 * AI文章生成の入力設定スキーマ
 */
export const portfolioGenerationSettingsSchema = z.object({
  selectedSummaryIds: z.array(z.string()).max(5).optional().default([]),
  selfPrDraft: z.string().optional().default(""),
});

/**
 * ポートフォリオで表示するAI生成文章スキーマ
 */
export const portfolioGeneratedContentSchema = z.object({
  selfPr: z.string().optional().default(""),
  strengths: z.string().optional().default(""),
  learnings: z.string().optional().default(""),
  futureVision: z.string().optional().default(""),
});

/**
 * ポートフォリオ設定全体のスキーマ
 */
export const portfolioSettingsSchema = z.object({
  profile: profileSettingsSchema,
  generation: portfolioGenerationSettingsSchema
    .optional()
    .default({ selectedSummaryIds: [], selfPrDraft: "" }),
  generatedContent: portfolioGeneratedContentSchema.optional().default({
    selfPr: "",
    strengths: "",
    learnings: "",
    futureVision: "",
  }),
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

/**
 * AI生成対象セクションの列挙
 */
export const portfolioGeneratedSectionEnum = z.enum([
  "selfPr",
  "strengths",
  "learnings",
  "futureVision",
]);

/**
 * AI文章生成APIのリクエストスキーマ
 */
export const generatePortfolioContentRequestSchema = z
  .object({
    selectedSummaryIds: z
      .array(z.string().min(1))
      .max(5, "サマリーは最大5件まで選択できます"),
    selfPrDraft: z.string().optional().default(""),
    profile: profileSettingsSchema,
    currentContent: portfolioGeneratedContentSchema.optional().default({
      selfPr: "",
      strengths: "",
      learnings: "",
      futureVision: "",
    }),
    targetSection: portfolioGeneratedSectionEnum.optional(),
  })
  .superRefine((value, context) => {
    if (
      value.selectedSummaryIds.length === 0 &&
      value.selfPrDraft.trim().length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "サマリーを1件以上選択するか、自己PR下書きを入力してください",
        path: ["selfPrDraft"],
      });
    }
  });

/**
 * AI文章生成APIのリクエスト型
 */
export type GeneratePortfolioContentRequest = z.infer<
  typeof generatePortfolioContentRequestSchema
>;

/**
 * AI生成対象セクション型
 */
export type PortfolioGeneratedSectionKey = z.infer<
  typeof portfolioGeneratedSectionEnum
>;

/**
 * AI生成文章型
 */
export type PortfolioGeneratedContent = z.infer<
  typeof portfolioGeneratedContentSchema
>;
