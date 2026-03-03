import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { GetDashboardDataUsecase } from "../../core/application/usecases/getDashboardDataUsecase";
import { SyncExternalDataUsecase } from "../../core/application/usecases/syncExternalDataUsecase";
import { DrizzleExternalActivityRepository } from "../../infrastructure/repositories/drizzleExternalActivityRepository";
import { DrizzleUserIntegrationRepository } from "../../infrastructure/repositories/drizzleUserIntegrationRepository";
import { buildErrorResponse } from "../../lib/buildErrorResponse";

const getUserIdFromJwt = (c: { get: (key: string) => unknown }): string => {
  const jwtPayload = c.get("jwtPayload") as { sub?: string } | undefined;
  if (!jwtPayload?.sub) {
    throw new HTTPException(401, { message: "Invalid token" });
  }
  return jwtPayload.sub;
};

export const createDashboardRoutes = () => {
  return new Hono<{ Bindings: Env }>()
    // ===== 外部サービスとの手動同期 =====
    .post(
      "/dashboard/sync/:provider",
      zValidator(
        "param",
        z.object({
          provider: z.enum(["github", "wakatime", "qiita", "zenn", "atcoder"]),
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
        }
      ),
      async (c) => {
        const userId = getUserIdFromJwt(c);
        const { provider } = c.req.valid("param");

        const db = drizzle(c.env.DB);
        const externalActivityRepo = new DrizzleExternalActivityRepository(db);
        const userIntegrationRepo = new DrizzleUserIntegrationRepository(db);
        const usecase = new SyncExternalDataUsecase(externalActivityRepo, userIntegrationRepo);

        try {
          const syncedItemsCount = await usecase.execute(userId, provider);
          return c.json({ message: `Successfully synced ${provider} data`, syncedItemsCount }, 200);
        } catch (error) {
          throw new HTTPException(500, { message: "Failed to sync external data" });
        }
      }
    )

    // ===== ヒートマップデータ取得 =====
    .get(
      "/dashboard/heatmap",
      zValidator(
        "query",
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      ),
      async (c) => {
        const userId = getUserIdFromJwt(c);
        const query = c.req.valid("query");
        
        // デフォルトは過去1年
        const today = new Date();
        const lastYear = new Date();
        lastYear.setFullYear(today.getFullYear() - 1);
        
        const startDate = query.startDate || lastYear.toISOString().split("T")[0];
        const endDate = query.endDate || today.toISOString().split("T")[0];

        const db = drizzle(c.env.DB);
        const externalActivityRepo = new DrizzleExternalActivityRepository(db);
        const usecase = new GetDashboardDataUsecase(externalActivityRepo);

        const heatmapData = await usecase.getHeatmapData(userId, startDate, endDate);
        return c.json({ heatmapData }, 200);
      }
    )

    // ===== ダッシュボード統計データ取得 =====
    .get("/dashboard/stats", async (c) => {
      const userId = getUserIdFromJwt(c);

      const db = drizzle(c.env.DB);
      const externalActivityRepo = new DrizzleExternalActivityRepository(db);
      const usecase = new GetDashboardDataUsecase(externalActivityRepo);

      const stats = await usecase.getStatsData(userId);
      return c.json({ stats }, 200);
    });
};
