import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";
import { buildErrorResponse } from "./lib/buildErrorResponse";
import { createActivityRoutes } from "./presentation/routes/activityRoutes";
import {
  createAuthIntegrationCallbackRoutes,
  createAuthIntegrationRoutes,
} from "./presentation/routes/authIntegrationRoutes";
import { createAuthRoutes } from "./presentation/routes/authRoutes";
import { createDashboardRoutes } from "./presentation/routes/dashboardRoutes";
import { createRoadmapRoutes } from "./presentation/routes/roadmapRoutes";

const app = new Hono<{ Bindings: Env }>()
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return buildErrorResponse(c, err.status ?? 500, err.message || "Error");
    }

    // それ以外の予期せぬエラー（DB接続エラーやコードのバグなど）は500にする
    console.error("System Error:", err);
    return buildErrorResponse(c, 500, "Internal Server Error");
  })

  .use("*", async (c, next) => {
    const corsMiddlewareHandler = cors({
      origin: c.env.FRONTEND_ORIGIN,
      allowHeaders: [
        "X-Custom-Header",
        "Upgrade-Insecure-Requests",
        "Content-Type",
        "Authorization",
      ],
      allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
      exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
      maxAge: 600,
    });
    return corsMiddlewareHandler(c, next);
  })

  // /api/* 配下のルートにはJWT認証を適用
  .use("/api/*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
      alg: "HS256",
    });
    return jwtMiddleware(c, next);
  })

  // 公開ルート（認証不要）
  .route("/", createAuthRoutes())
  .route("/auth", createAuthIntegrationCallbackRoutes())

  // 保護されたルート（JWT認証必須）
  .route("/api/auth", createAuthIntegrationRoutes())
  .route("/api/roadmap", createRoadmapRoutes())
  .route("/api", createDashboardRoutes())
  .route("/api", createActivityRoutes());

export type AppType = typeof app;

export default {
  fetch: app.fetch,
  async scheduled(event: any, _env: Env, _ctx: any) {
    console.log("Cron triggered:", event.cron);
    // モック実装：将来的には全ユーザーの userIntegrations を取得してループで syncExternalDataUsecase を呼び出す
    /*
    const { drizzle } = await import("drizzle-orm/d1");
    const { DrizzleExternalActivityRepository } = await import("./infrastructure/repositories/drizzleExternalActivityRepository");
    const { DrizzleUserIntegrationRepository } = await import("./infrastructure/repositories/drizzleUserIntegrationRepository");
    const { SyncExternalDataUsecase } = await import("./core/application/usecases/syncExternalDataUsecase");

    const db = drizzle(env.DB);
    const usecase = new SyncExternalDataUsecase(
      new DrizzleExternalActivityRepository(db),
      new DrizzleUserIntegrationRepository(db)
    );
    // ...各ユーザーとプロバイダに対して同期処理を実行...
    */
  },
};
