/// <reference path="../../../worker-configuration.d.ts" />
import { zValidator } from "@hono/zod-validator";
import { streamText } from "ai";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { DeleteSummaryUsecase } from "../../core/application/usecases/deleteSummaryUsecase";
import {
  GenerateSummaryUsecase,
  NoActivityLogsError,
} from "../../core/application/usecases/generateSummaryUsecase";
import {
  GetSummariesUsecase,
  SummaryAccessDeniedError,
  SummaryNotFoundError,
} from "../../core/application/usecases/getSummariesUsecase";
import { SaveSummaryUsecase } from "../../core/application/usecases/saveSummaryUsecase";
import { UpdateSummaryUsecase } from "../../core/application/usecases/updateSummaryUsecase";
import { getSummaryLLM } from "../../infrastructure/ai/llmProvider";
import { buildSummarySystemPrompt } from "../../infrastructure/ai/prompts/summarySystemPrompt";
import { DrizzleActivityLogRepository } from "../../infrastructure/repositories/drizzleActivityLogRepository";
import { DrizzleSummaryRepository } from "../../infrastructure/repositories/drizzleSummaryRepository";
import { buildErrorResponse } from "../../lib/buildErrorResponse";
import {
  generateSummaryRequestSchema,
  saveSummaryRequestSchema,
  updateSummaryRequestSchema,
} from "../../schema/summary";

/**
 * ドメインエラーをHTTPExceptionに変換するヘルパー関数
 */
const handleDomainError = (error: unknown): never => {
  if (error instanceof NoActivityLogsError) {
    throw new HTTPException(404, { message: error.message });
  }
  if (error instanceof SummaryNotFoundError) {
    throw new HTTPException(404, { message: error.message });
  }
  if (error instanceof SummaryAccessDeniedError) {
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
 * サマリー関連のHonoルーティングを生成するファクトリ関数
 *
 * @returns サマリールートが定義されたHonoアプリインスタンス
 */
export const createSummaryRoutes = () => {
  return (
    new Hono<{ Bindings: Env }>()

      // ===== サマリー生成 (Streaming API) =====
      .post(
        "/summary/generate",
        zValidator("json", generateSummaryRequestSchema, (result, c) => {
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
          const input = c.req.valid("json");

          try {
            const db = drizzle(c.env.DB);
            const activityLogRepository = new DrizzleActivityLogRepository(db);
            const usecase = new GenerateSummaryUsecase(activityLogRepository);

            // 活動記録データを取得
            const context = await usecase.execute(input.milestoneId);

            // プロンプト構築
            const systemPrompt = buildSummarySystemPrompt(
              context.activityLogs,
              input.format,
            );

            // LLMプロバイダーとモデルの設定取得
            const { model } = getSummaryLLM(c.env);

            // テキストをストリーミングで生成
            const result = streamText({
              model,
              system: systemPrompt,
              prompt:
                "上記の活動記録をもとに、学習の軌跡と成長のストーリーを含むサマリーを作成してください。",
            });

            // Vercel AI SDKが生成する標準のストリーミングレスポンス
            const streamResponse = result.toTextStreamResponse();

            // Cloudflare Workers + Hono 環境でのバッファリングを防ぐための追加ヘッダーを設定
            for (const [key, value] of streamResponse.headers.entries()) {
              c.header(key, value);
            }
            c.header("Content-Encoding", "identity");

            return new Response(streamResponse.body, {
              headers: c.res.headers,
            });
          } catch (error) {
            handleDomainError(error);
          }
        },
      )

      // ===== サマリー保存 =====
      .post(
        "/summary",
        zValidator("json", saveSummaryRequestSchema, (result, c) => {
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
          const summaryRepository = new DrizzleSummaryRepository(db);
          const usecase = new SaveSummaryUsecase(summaryRepository);

          const summaryId = await usecase.execute({
            userId,
            milestoneId: input.milestoneId,
            title: input.title,
            content: input.content,
          });

          return c.json({ summaryId }, 201);
        },
      )

      // ===== マイルストーン別サマリー一覧取得 =====
      .get("/summary/milestone/:milestoneId", async (c) => {
        const milestoneId = c.req.param("milestoneId");

        const db = drizzle(c.env.DB);
        const summaryRepository = new DrizzleSummaryRepository(db);
        const usecase = new GetSummariesUsecase(summaryRepository);

        const summaryList = await usecase.execute(milestoneId);
        return c.json({ summaries: summaryList });
      })

      // ===== サマリー更新 =====
      .put(
        "/summary/:id",
        zValidator("json", updateSummaryRequestSchema, (result, c) => {
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
          const summaryId = c.req.param("id");
          const input = c.req.valid("json");

          const db = drizzle(c.env.DB);
          const summaryRepository = new DrizzleSummaryRepository(db);
          const usecase = new UpdateSummaryUsecase(summaryRepository);

          try {
            await usecase.execute(
              summaryId,
              userId,
              input.title,
              input.content,
            );
            return c.json({ message: "Summary updated successfully" });
          } catch (error) {
            handleDomainError(error);
          }
        },
      )

      // ===== サマリー削除 =====
      .delete("/summary/:id", async (c) => {
        const userId = getUserIdFromJwt(c);
        const summaryId = c.req.param("id");

        const db = drizzle(c.env.DB);
        const summaryRepository = new DrizzleSummaryRepository(db);
        const usecase = new DeleteSummaryUsecase(summaryRepository);

        try {
          await usecase.execute(summaryId, userId);
          return c.json({ message: "Summary deleted successfully" });
        } catch (error) {
          handleDomainError(error);
        }
      })
  );
};
