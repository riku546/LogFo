import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt, sign } from "hono/jwt";
import { users } from "./db/schema";

const app = new Hono<{ Bindings: Env }>();

app.use("auth/*", async (c, next) => {
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
});

app.use("/auth/*", (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  });
  return jwtMiddleware(c, next);
});

// ヘルスチェックエンドポイント
app.get("/health", (c) => {
  return c.text("Hello Hono!");
});
// ヘルスチェックエンドポイント(unauthorizedが返される)
app.get("/auth/health", (c) => {
  return c.json({ status: "ok" });
});

app.post("/signup", async (c) => {
  const { email, password, userName } = await c.req.json();

  if (!email || !password || !userName) {
    return c.json({ error: "Email, password, and username are required" }, 400);
  }

  const db = drizzle(c.env.DB);

  // 重複チェック
  const existingRows = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingRows.length) {
    return c.json({ error: "Email already in use" }, 409);
  }

  const hashed = await bcrypt.hash(password, 10);

  await db
    .insert(users)
    .values({ email, password: hashed, name: userName })
    .run();

  return c.json(
    {
      message: "User created successfully",
    },
    201,
  );
});

/**
 *  サインイン (Sign-in)
 * 認証に成功したら sign() を使ってJWTを発行します。
 */
app.post("/signin", async (c) => {
  const { email, password } = await c.req.json();

  const db = drizzle(c.env.DB);

  // ユーザー検索とパスワード確認
  const user = (await db.select().from(users).where(eq(users.email, email)))[0];

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const verified = await bcrypt.compare(password, user.password);
  if (!verified) {
    return c.json({ error: "Invalid credentials" }, 401);
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
});

export default app;
