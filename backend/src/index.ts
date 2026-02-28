import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception"; // HTTPExceptionをインポート
import { jwt, sign } from "hono/jwt";
import { users } from "./db/schema";
import { buildErrorResponse } from "./lib/buildErrorResponse";
import { signinSchema, signupSchema } from "./schema/auth";

const app = new Hono<{ Bindings: Env }>()
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      // HTTPExceptionの内容をJSONで返却し、形式を統一する
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

  .use("/auth/*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
      alg: "ES384",
    });
    return jwtMiddleware(c, next);
  })

  .post(
    "/signup",
    zValidator("json", signupSchema, (result, c) => {
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
      const { email, password, userName } = c.req.valid("json");

      const db = drizzle(c.env.DB);

      // 重複チェック
      const existingRows = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingRows.length) {
        throw new HTTPException(409, { message: "Email already in use" }); // HTTPExceptionをスロー
      }

      const hashed = await bcrypt.hash(password, 10);

      await db
        .insert(users)
        .values({ email, passwordHash: hashed, name: userName })
        .run();

      return c.json(
        {
          message: "User created successfully",
        },
        201,
      );
    },
  )

  /**
   *  サインイン (Sign-in)
   * 認証に成功したら sign() を使ってJWTを発行します。
   */
  .post(
    "/signin",
    zValidator("json", signinSchema, (result, c) => {
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
      const { email, password } = c.req.valid("json");
      console.log(email, password);

      const db = drizzle(c.env.DB);

      // ユーザー検索とパスワード確認
      const user = (
        await db.select().from(users).where(eq(users.email, email))
      )[0];

      if (!user) {
        throw new HTTPException(401, { message: "user not found" });
      }

      const verified = await bcrypt.compare(password, user.passwordHash);
      if (!verified) {
        throw new HTTPException(401, { message: "password is incorrect" });
      }

      // JWTペイロードの作成
      // exp (Expiration Time) を設定することで、verify時に有効期限チェックが行われます
      const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
      const payload = {
        sub: user.id,
        role: "user",
        exp: Math.floor(Date.now() / 1000) + ONE_WEEK_IN_SECONDS, // 1週間後に期限切れ
      };

      // トークンの署名 (生成)
      const token = await sign(payload, c.env.JWT_SECRET);

      return c.json({ token });
    },
  );

export type AppType = typeof app;
export default app;
