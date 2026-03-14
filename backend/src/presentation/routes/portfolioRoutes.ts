/// <reference path="../../../worker-configuration.d.ts" />
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  GeneratePortfolioNarrativeUsecase,
  SummarySelectionForbiddenError,
} from "../../core/application/usecases/portfolio/generatePortfolioNarrativeUsecase";
import { GetPortfolioUsecase } from "../../core/application/usecases/portfolio/getPortfolioUsecase";
import {
  GetPublicPortfolioUsecase,
  PortfolioNotFoundError,
  PortfolioNotPublicError,
} from "../../core/application/usecases/portfolio/getPublicPortfolioUsecase";
import {
  SavePortfolioUsecase,
  SlugAlreadyTakenError,
} from "../../core/application/usecases/portfolio/savePortfolioUsecase";
import { getSummaryLLM } from "../../infrastructure/ai/llmProvider";
import { AIPortfolioNarrativeGenerator } from "../../infrastructure/ai/portfolioNarrativeGenerator";
import { DrizzlePortfolioRepository } from "../../infrastructure/repositories/drizzlePortfolioRepository";
import { DrizzleSummaryRepository } from "../../infrastructure/repositories/drizzleSummaryRepository";
import { buildErrorResponse } from "../../lib/buildErrorResponse";
import { getUserIdFromJwt } from "../../lib/readJson";
import {
  generatePortfolioContentRequestSchema,
  savePortfolioRequestSchema,
} from "../../schema/portfolio";

/**
 * ドメインエラーをHTTPExceptionに変換するヘルパー関数
 */
const handleDomainError = (error: unknown): never => {
  if (error instanceof SlugAlreadyTakenError) {
    throw new HTTPException(409, { message: error.message });
  }
  if (error instanceof PortfolioNotFoundError) {
    throw new HTTPException(404, { message: error.message });
  }
  if (error instanceof PortfolioNotPublicError) {
    throw new HTTPException(403, { message: error.message });
  }
  if (error instanceof SummarySelectionForbiddenError) {
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
/**
 * ポートフォリオ関連のHonoルーティングを生成するファクトリ関数（JWT認証必須ルート）
 *
 * @returns ポートフォリオルートが定義されたHonoアプリインスタンス
 */
export const createPortfolioRoutes = () => {
  return (
    new Hono<{ Bindings: Env }>()

      // ===== ポートフォリオ設定の保存（UPSERT） =====
      .post(
        "/portfolio/generate",
        zValidator(
          "json",
          generatePortfolioContentRequestSchema,
          (result, c) => {
            if (!result.success) {
              return buildErrorResponse(
                c,
                400,
                "Validation Error",
                result.error.issues.map((issue) => issue.message),
              );
            }
          },
        ),
        async (c) => {
          const userId = getUserIdFromJwt(c);
          const input = c.req.valid("json");
          const encoder = new TextEncoder();

          const db = drizzle(c.env.DB);
          const summaryRepository = new DrizzleSummaryRepository(db);
          const { model } = getSummaryLLM(c.env);
          const narrativeGenerator = new AIPortfolioNarrativeGenerator(model);
          const usecase = new GeneratePortfolioNarrativeUsecase(
            summaryRepository,
            narrativeGenerator,
          );

          try {
            const stream = await usecase.execute({
              userId,
              chatInput: input.chatInput,
              targetSection: input.targetSection,
              selectedSummaryIds: input.selectedSummaryIds,
              profile: input.profile,
              currentContent: input.currentContent,
            });

            const readableStream = new ReadableStream<Uint8Array>({
              async start(controller) {
                let generatedText = "";

                try {
                  for await (const chunk of stream) {
                    generatedText += chunk;
                    controller.enqueue(
                      encoder.encode(
                        `event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`,
                      ),
                    );
                  }

                  controller.enqueue(
                    encoder.encode(
                      `event: complete\ndata: ${JSON.stringify({ text: generatedText })}\n\n`,
                    ),
                  );
                  controller.close();
                } catch {
                  controller.enqueue(
                    encoder.encode(
                      `event: error\ndata: ${JSON.stringify({ message: "ポートフォリオ文章の生成に失敗しました" })}\n\n`,
                    ),
                  );
                  controller.close();
                }
              },
            });

            return c.newResponse(readableStream, 200, {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              "X-Accel-Buffering": "no",
              Connection: "keep-alive",
            });
          } catch (error) {
            handleDomainError(error);
          }
        },
      )

      .post(
        "/portfolio",
        zValidator("json", savePortfolioRequestSchema, (result, c) => {
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
          const portfolioRepository = new DrizzlePortfolioRepository(db);
          const usecase = new SavePortfolioUsecase(portfolioRepository);

          try {
            const portfolioId = await usecase.execute({
              userId,
              slug: input.slug,
              isPublic: input.isPublic,
              settings: input.settings,
            });

            return c.json({ portfolioId }, 201);
          } catch (error) {
            handleDomainError(error);
          }
        },
      )

      // ===== 自分のポートフォリオ設定取得 =====
      .get("/portfolio", async (c) => {
        const userId = getUserIdFromJwt(c);

        const db = drizzle(c.env.DB);
        const portfolioRepository = new DrizzlePortfolioRepository(db);
        const usecase = new GetPortfolioUsecase(portfolioRepository);

        const portfolio = await usecase.execute(userId);
        if (!portfolio) {
          throw new HTTPException(404, {
            message: "ポートフォリオが見つかりません",
          });
        }

        return c.json({ portfolio });
      })
  );
};

/**
 * 公開ポートフォリオのHonoルーティングを生成するファクトリ関数（認証不要ルート）
 *
 * @returns 公開ポートフォリオルートが定義されたHonoアプリインスタンス
 */
export const createPublicPortfolioRoutes = () => {
  return (
    new Hono<{ Bindings: Env }>()

      // ===== 公開ポートフォリオ取得（認証不要） =====
      .get("/public/:slug", async (c) => {
        const slug = c.req.param("slug");

        const db = drizzle(c.env.DB);
        const portfolioRepository = new DrizzlePortfolioRepository(db);
        const usecase = new GetPublicPortfolioUsecase(portfolioRepository);

        try {
          const portfolioData = await usecase.execute(slug);
          return c.json({ portfolio: portfolioData });
        } catch (error) {
          handleDomainError(error);
        }
      })
  );
};
