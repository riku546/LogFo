/// <reference path="../../../worker-configuration.d.ts" />
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateActivityLogUsecase } from "../../core/application/usecases/createActivityLogUsecase";
import { DeleteActivityLogUsecase } from "../../core/application/usecases/deleteActivityLogUsecase";
import {
  ActivityLogAccessDeniedError,
  ActivityLogNotFoundError,
  GetActivityLogsUsecase,
} from "../../core/application/usecases/getActivityLogsUsecase";
import { UpdateActivityLogUsecase } from "../../core/application/usecases/updateActivityLogUsecase";
import { tasks } from "../../infrastructure/database/schema";
import { DrizzleActivityLogRepository } from "../../infrastructure/repositories/drizzleActivityLogRepository";
import { buildErrorResponse } from "../../lib/buildErrorResponse";
import {
  createActivityLogRequestSchema,
  updateActivityLogRequestSchema,
  updateTaskStatusRequestSchema,
} from "../../schema/activity";

/**
 * ドメインエラーをHTTPExceptionに変換するヘルパー関数
 */
const handleDomainError = (error: unknown): never => {
  if (error instanceof ActivityLogNotFoundError) {
    throw new HTTPException(404, { message: error.message });
  }
  if (error instanceof ActivityLogAccessDeniedError) {
    throw new HTTPException(403, { message: error.message });
  }
  throw error;
};

/**
 * JWTペイロードからユーザーIDを取得するヘルパー関数
 *
 * @param c - Honoのコンテキスト
 * @returns ユーザーID
 * @throws {HTTPException} JWTペイロードにユーザーIDがない場合
 */
const getUserIdFromJwt = (c: { get: (key: string) => unknown }): string => {
  const jwtPayload = c.get("jwtPayload") as { sub?: string } | undefined;
  if (!jwtPayload?.sub) {
    throw new HTTPException(401, { message: "Invalid token" });
  }
  return jwtPayload.sub;
};

/**
 * 活動記録関連のHonoルーティングを生成するファクトリ関数
 *
 * @returns 活動記録ルートが定義されたHonoアプリインスタンス
 */
export const createActivityRoutes = () => {
  return (
    new Hono<{ Bindings: Env }>()

      // ===== 活動記録一覧取得 =====
      .get("/activities/:taskId", async (c) => {
        const taskId = c.req.param("taskId");

        const db = drizzle(c.env.DB);
        const activityLogRepository = new DrizzleActivityLogRepository(db);
        const usecase = new GetActivityLogsUsecase(activityLogRepository);

        const activityLogs = await usecase.execute(taskId);
        return c.json({ activityLogs });
      })

      // ===== 活動記録作成 =====
      .post(
        "/activities",
        zValidator("json", createActivityLogRequestSchema, (result, c) => {
          if (!result.success) {
            return buildErrorResponse(
              c,
              400,
              "Validation Error",
              result.error.issues.map((issue) => issue.message),
            );
          }
        }),
        async (c) => {
          const userId = getUserIdFromJwt(c);
          const input = c.req.valid("json");

          const db = drizzle(c.env.DB);
          const activityLogRepository = new DrizzleActivityLogRepository(db);
          const usecase = new CreateActivityLogUsecase(activityLogRepository);

          const activityLogId = await usecase.execute({
            userId,
            taskId: input.taskId,
            content: input.content,
            loggedDate: input.loggedDate,
          });

          return c.json({ activityLogId }, 201);
        },
      )

      // ===== 活動記録更新 =====
      .put(
        "/activities/:activityId",
        zValidator("json", updateActivityLogRequestSchema, (result, c) => {
          if (!result.success) {
            return buildErrorResponse(
              c,
              400,
              "Validation Error",
              result.error.issues.map((issue) => issue.message),
            );
          }
        }),
        async (c) => {
          const userId = getUserIdFromJwt(c);
          const activityId = c.req.param("activityId");
          const input = c.req.valid("json");

          const db = drizzle(c.env.DB);
          const activityLogRepository = new DrizzleActivityLogRepository(db);
          const usecase = new UpdateActivityLogUsecase(activityLogRepository);

          try {
            await usecase.execute(activityId, userId, input.content);
            return c.json({ message: "Activity log updated successfully" });
          } catch (error) {
            handleDomainError(error);
          }
        },
      )

      // ===== 活動記録削除 =====
      .delete("/activities/:activityId", async (c) => {
        const userId = getUserIdFromJwt(c);
        const activityId = c.req.param("activityId");

        const db = drizzle(c.env.DB);
        const activityLogRepository = new DrizzleActivityLogRepository(db);
        const usecase = new DeleteActivityLogUsecase(activityLogRepository);

        try {
          await usecase.execute(activityId, userId);
          return c.json({ message: "Activity log deleted successfully" });
        } catch (error) {
          handleDomainError(error);
        }
      })

      // ===== タスクステータス個別更新 =====
      .patch(
        "/tasks/:taskId/status",
        zValidator("json", updateTaskStatusRequestSchema, (result, c) => {
          if (!result.success) {
            return buildErrorResponse(
              c,
              400,
              "Validation Error",
              result.error.issues.map((issue) => issue.message),
            );
          }
        }),
        async (c) => {
          const taskId = c.req.param("taskId");
          const { status } = c.req.valid("json");

          const db = drizzle(c.env.DB);

          // タスクの存在確認
          const taskRows = await db
            .select()
            .from(tasks)
            .where(eq(tasks.id, taskId));
          const task = taskRows[0];

          if (!task) {
            throw new HTTPException(404, { message: "Task not found" });
          }

          // タスクのステータスを更新
          await db
            .update(tasks)
            .set({ status, updatedAt: new Date() })
            .where(eq(tasks.id, taskId));

          return c.json({ message: "Task status updated successfully" });
        },
      )
  );
};
