import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { IntegrationUnauthorizedError } from "../../core/application/errors/integrationError";
import { GetDashboardDataUsecase } from "../../core/application/usecases/getDashboardDataUsecase";
import { SyncExternalDataUsecase } from "../../core/application/usecases/syncExternalDataUsecase";
import { GithubService } from "../../infrastructure/external/githubService";
import { WakatimeService } from "../../infrastructure/external/wakatimeService";
import { DrizzleExternalActivityRepository } from "../../infrastructure/repositories/drizzleExternalActivityRepository";
import { DrizzleUserIntegrationRepository } from "../../infrastructure/repositories/drizzleUserIntegrationRepository";
import { buildErrorResponse } from "../../lib/buildErrorResponse";
import { getUserIdFromJwt } from "../../lib/readJson";

export const createDashboardRoutes = () => {
  return (
    new Hono<{ Bindings: Env }>()
      // ===== 外部サービスとの手動同期 =====
      .post(
        "/dashboard/sync/:provider",
        zValidator(
          "param",
          z.object({
            provider: z.enum([
              "github",
              "wakatime",
              "qiita",
              "zenn",
              "atcoder",
            ]),
          }),
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
          const { provider } = c.req.valid("param");

          const db = drizzle(c.env.DB);
          const externalActivityRepo = new DrizzleExternalActivityRepository(
            db,
          );
          const userIntegrationRepo = new DrizzleUserIntegrationRepository(db);
          const githubService = new GithubService();
          const wakatimeService = new WakatimeService();
          const usecase = new SyncExternalDataUsecase(
            externalActivityRepo,
            userIntegrationRepo,
            githubService,
            wakatimeService,
          );

          try {
            const syncedItemsCount = await usecase.execute(userId, provider);
            return c.json(
              {
                message: `Successfully synced ${provider} data`,
                syncedItemsCount,
              },
              200,
            );
          } catch (error) {
            if (error instanceof IntegrationUnauthorizedError) {
              return c.json(
                {
                  success: false,
                  errorMessage: error.message,
                  provider: error.provider,
                },
                401,
              );
            }
            console.log(error);
            throw new HTTPException(
              500,
              error instanceof Error ? { message: error.message } : undefined,
            );
          }
        },
      )

      // ===== プロバイダー別ウィジェットデータ取得 =====
      .get("/dashboard/provider-widgets", async (c) => {
        const userId = getUserIdFromJwt(c);

        const db = drizzle(c.env.DB);
        const externalActivityRepo = new DrizzleExternalActivityRepository(db);
        const usecase = new GetDashboardDataUsecase(externalActivityRepo);

        const widgetsData = await usecase.getProviderWidgetsData(userId);
        return c.json({ widgetsData }, 200);
      })

      // ===== ダッシュボード統計データ取得 =====
      .get("/dashboard/stats", async (c) => {
        const userId = getUserIdFromJwt(c);

        const db = drizzle(c.env.DB);
        const externalActivityRepo = new DrizzleExternalActivityRepository(db);
        const usecase = new GetDashboardDataUsecase(externalActivityRepo);

        const stats = await usecase.getStatsData(userId);
        return c.json({ stats }, 200);
      })
  );
};
