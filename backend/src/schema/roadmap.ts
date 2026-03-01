import { z } from "zod";

/**
 * ロードマップ生成APIのリクエストスキーマ（JSON部分）
 * フォーム入力データのバリデーションに使用します。
 */
export const generateRoadmapRequestSchema = z.object({
  currentOccupation: z.string().min(1, "現在の職種を入力してください"),
  currentSkills: z
    .array(z.string())
    .min(1, "経験のあるスキルを1つ以上入力してください"),
  otherSkills: z.string().optional(),
  dailyStudyHours: z
    .number()
    .min(0.5, "学習時間は0.5時間以上を入力してください")
    .max(24, "学習時間は24時間以下を入力してください"),
  targetCompanies: z.array(z.string()).optional(),
  targetPosition: z.string().min(1, "目指す職種を入力してください"),
  targetSkills: z.string().optional(),
  targetPeriodMonths: z
    .number()
    .min(1, "目標期間は1ヶ月以上を入力してください")
    .max(60, "目標期間は60ヶ月以下を入力してください"),
});

/**
 * ロードマップ生成APIのリクエスト型
 */
export type GenerateRoadmapRequest = z.infer<
  typeof generateRoadmapRequestSchema
>;

/**
 * ロードマップ保存APIのマイルストーン内タスクスキーマ
 */
const saveTaskSchema = z.object({
  title: z.string().min(1),
  estimatedHours: z.number().nullable(),
  orderIndex: z.number().int().min(0),
});

/**
 * ロードマップ保存APIのマイルストーンスキーマ
 */
const saveMilestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  orderIndex: z.number().int().min(0),
  tasks: z.array(saveTaskSchema),
});

/**
 * ロードマップ保存APIのリクエストスキーマ
 */
export const saveRoadmapRequestSchema = z.object({
  currentState: z.string().min(1),
  goalState: z.string().min(1),
  pdfContext: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  milestones: z.array(saveMilestoneSchema),
});

/**
 * ロードマップ保存APIのリクエスト型
 */
export type SaveRoadmapRequest = z.infer<typeof saveRoadmapRequestSchema>;

/**
 * ロードマップ更新APIのマイルストーン内タスクスキーマ
 */
const updateTaskSchema = z.object({
  id: z.string().optional(), // 新規追加のタスクはidなし
  title: z.string().min(1),
  estimatedHours: z.number().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  orderIndex: z.number().int().min(0),
});

/**
 * ロードマップ更新APIのマイルストーンスキーマ
 */
const updateMilestoneSchema = z.object({
  id: z.string().optional(), // 新規追加のマイルストーンはidなし
  title: z.string().min(1),
  description: z.string().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  orderIndex: z.number().int().min(0),
  tasks: z.array(updateTaskSchema),
});

/**
 * ロードマップ更新APIのリクエストスキーマ
 */
export const updateRoadmapRequestSchema = z.object({
  currentState: z.string().min(1),
  goalState: z.string().min(1),
  pdfContext: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  milestones: z.array(updateMilestoneSchema),
});

/**
 * ロードマップ更新APIのリクエスト型
 */
export type UpdateRoadmapRequest = z.infer<typeof updateRoadmapRequestSchema>;
