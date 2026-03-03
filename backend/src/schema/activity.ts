import { z } from "zod";

/**
 * 活動記録作成APIのリクエストスキーマ
 */
export const createActivityLogRequestSchema = z.object({
  taskId: z.string().min(1, "タスクIDは必須です"),
  content: z.string().min(1, "活動内容を入力してください"),
  loggedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください"),
});

/**
 * 活動記録作成APIのリクエスト型
 */
export type CreateActivityLogRequest = z.infer<
  typeof createActivityLogRequestSchema
>;

/**
 * 活動記録更新APIのリクエストスキーマ
 */
export const updateActivityLogRequestSchema = z.object({
  content: z.string().min(1, "活動内容を入力してください"),
});

/**
 * 活動記録更新APIのリクエスト型
 */
export type UpdateActivityLogRequest = z.infer<
  typeof updateActivityLogRequestSchema
>;

/**
 * タスクステータス更新APIのリクエストスキーマ
 */
export const updateTaskStatusRequestSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"], {
    message: "ステータスはTODO, IN_PROGRESS, DONEのいずれかです",
  }),
});

/**
 * タスクステータス更新APIのリクエスト型
 */
export type UpdateTaskStatusRequest = z.infer<
  typeof updateTaskStatusRequestSchema
>;
