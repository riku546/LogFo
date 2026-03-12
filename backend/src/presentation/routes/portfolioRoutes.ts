/// <reference path="../../../worker-configuration.d.ts" />
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { GetPortfolioUsecase } from "../../core/application/usecases/getPortfolioUsecase";
import {
  GetPublicPortfolioUsecase,
  PortfolioNotFoundError,
  PortfolioNotPublicError,
} from "../../core/application/usecases/getPublicPortfolioUsecase";
import {
  SavePortfolioUsecase,
  SlugAlreadyTakenError,
} from "../../core/application/usecases/savePortfolioUsecase";
import { DrizzlePortfolioRepository } from "../../infrastructure/repositories/drizzlePortfolioRepository";
import { DrizzleRoadmapRepository } from "../../infrastructure/repositories/drizzleRoadmapRepository";
import { DrizzleSummaryRepository } from "../../infrastructure/repositories/drizzleSummaryRepository";
import { buildErrorResponse } from "../../lib/buildErrorResponse";
import { getUserIdFromJwt } from "../../lib/readJson";
import { savePortfolioRequestSchema } from "../../schema/portfolio";

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
        const summaryRepository = new DrizzleSummaryRepository(db);
        const roadmapRepository = new DrizzleRoadmapRepository(db);

        const usecase = new GetPublicPortfolioUsecase(
          portfolioRepository,
          summaryRepository,
          roadmapRepository,
        );

        try {
          const portfolioData = await usecase.execute(slug);
          return c.json({ portfolio: portfolioData });
        } catch (error) {
          handleDomainError(error);
        }
      })
  );
};
