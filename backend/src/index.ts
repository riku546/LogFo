import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";
import { buildErrorResponse } from "./lib/buildErrorResponse";
import { createActivityRoutes } from "./presentation/routes/activityRoutes";
import { createAuthRoutes } from "./presentation/routes/authRoutes";
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

  // 保護されたルート（JWT認証必須）
  .route("/api/roadmap", createRoadmapRoutes())
  .route("/api", createActivityRoutes());

export type AppType = typeof app;
export default app;
