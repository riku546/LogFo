import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { z } from "zod";
import { DrizzleUserIntegrationRepository } from "../../infrastructure/repositories/drizzleUserIntegrationRepository";
import { getUserIdFromJwt, readJson } from "../../lib/readJson";

export const createAuthIntegrationRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.get("/status", async (c) => {
    const userId = getUserIdFromJwt(c);
    const db = drizzle(c.env.DB);
    const repo = new DrizzleUserIntegrationRepository(db);
    const integrations = await repo.getAllByUserId(userId);
    return c.json({
      integrations: integrations.map((i) => ({
        provider: i.provider,
        connected: true,
      })),
    });
  });

  // プロバイダ（GitHubなど）ごとのOAuth認証開始エンドポイント
  router.get("/:provider", async (c) => {
    const provider = c.req.param("provider");
    // コールバックURLを公開ルート（/auth/:provider/callback）に向けるよう調整
    // request.url (ex: https://api.example.com/api/auth/github) から origin (https://api.example.com) を取得する
    const userId = getUserIdFromJwt(c);
    const baseUrl = new URL(c.req.url);
    const redirectUri = `${baseUrl.origin}/auth/${provider}/callback`;

    // Cookieの代わりに署名付きStateを作成
    // userIdを含め、有効期限（10分）を設定する
    const statePayload = {
      sub: userId,
      nonce: crypto.randomUUID(),
      exp: Math.floor(Date.now() / 1000) + 60 * 10,
    };
    const state = await sign(statePayload, c.env.JWT_SECRET, "HS256");

    if (provider === "github") {
      const clientId = c.env.GITHUB_CLIENT_ID;
      if (!clientId)
        return c.json({ message: "GitHub Client ID is not configured" }, 500);

      // GitHubのOAuth認可URLを構築（スコープはリポジトリ読み取りなどを要求可能。環境により調整）
      const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
      githubAuthUrl.searchParams.set("client_id", clientId);
      githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
      githubAuthUrl.searchParams.set("state", state);
      // githubAuthUrl.searchParams.set("scope", "read:user repo"); // 必要に応じて変更

      // SPAでのAPI通信に対応するためJSONでリダイレクト先を返す
      return c.json({ redirectUrl: githubAuthUrl.toString() });
    }

    if (provider === "wakatime") {
      const clientId = c.env.WAKATIME_APP_ID;
      if (!clientId)
        return c.json({ message: "WakaTime App ID is not configured" }, 500);

      const wakatimeAuthUrl = new URL("https://wakatime.com/oauth/authorize");
      wakatimeAuthUrl.searchParams.set("client_id", clientId);
      wakatimeAuthUrl.searchParams.set("response_type", "code");
      wakatimeAuthUrl.searchParams.set("redirect_uri", redirectUri);
      wakatimeAuthUrl.searchParams.set(
        "scope",
        "email,read_stats,read_logged_time",
      );
      wakatimeAuthUrl.searchParams.set("state", state);

      return c.json({ redirectUrl: wakatimeAuthUrl.toString() });
    }

    return c.json({ message: `Provider ${provider} is not supported` }, 400);
  });

  return router;
};

// 補助関数: プロバイダごとのコールバック処理
async function handleGithubCallback(
  c: { env: Env; req: { url: string } },
  code: string,
  userId: string,
) {
  // 1. Exchange code for access token
  const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await readJson<{
    access_token?: string;
    error?: string;
  }>(tokenResp);
  if (!tokenData.access_token) {
    throw new Error(tokenData.error || "Failed to get access token");
  }

  // 2. Get GitHub user info
  const userResp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${tokenData.access_token}`,
      "User-Agent": "LogFo-App",
    },
  });
  const githubUser = await readJson<{
    id: number;
    login: string;
  }>(userResp);

  // 3. Save to database
  const db = drizzle(c.env.DB);
  const repo = new DrizzleUserIntegrationRepository(db);
  await repo.upsertIntegration({
    userId,
    provider: "github",
    providerUserId: githubUser.login,
    accessToken: tokenData.access_token,
  });
}

async function handleWakatimeCallback(
  c: { env: Env; req: { url: string } },
  code: string,
  userId: string,
) {
  // 1. Exchange code for access token
  const tokenResp = await fetch("https://wakatime.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: c.env.WAKATIME_APP_ID,
      client_secret: c.env.WAKATIME_APP_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${new URL(c.req.url).origin}/auth/wakatime/callback`,
    }),
  });

  const tokenData = await readJson<{
    access_token?: string;
    error?: string;
  }>(tokenResp);
  if (!tokenData.access_token) {
    throw new Error(tokenData.error || "Failed to get WakaTime access token");
  }

  // 2. Get WakaTime user info
  const userResp = await fetch("https://wakatime.com/api/v1/users/current", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });
  const wakaUser = await readJson<{
    data: { id: string; username: string };
  }>(userResp);

  // 3. Save to database
  const db = drizzle(c.env.DB);
  const repo = new DrizzleUserIntegrationRepository(db);
  await repo.upsertIntegration({
    userId,
    provider: "wakatime",
    providerUserId: wakaUser.data.username || wakaUser.data.id,
    accessToken: tokenData.access_token,
  });
}

// 補助関数: リダイレクトURLの生成
function buildRedirectUrl(
  origin: string,
  provider: string,
  status: "success" | "error",
  message?: string,
) {
  const frontendUrl = new URL(origin);
  frontendUrl.pathname = `/auth/callback/${provider}`;
  frontendUrl.searchParams.set("integration", status);
  if (message) {
    frontendUrl.searchParams.set("message", message);
  }
  return frontendUrl.toString();
}

type CallbackContext = { env: Env; req: { url: string } };

const runProviderCallback = async (
  provider: string,
  c: CallbackContext,
  code: string,
  userId: string,
) => {
  if (provider === "github") {
    await handleGithubCallback(c, code, userId);
    return;
  }

  if (provider === "wakatime") {
    await handleWakatimeCallback(c, code, userId);
    return;
  }

  throw new Error(`Provider ${provider} not supported yet for callback`);
};

// OAuthプロバイダからのコールバック受取用ルート（JWT認証が不要な公開ルート）
export const createAuthIntegrationCallbackRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.get("/:provider/callback", async (c) => {
    const provider = c.req.param("provider");
    const code = c.req.query("code");
    const state = c.req.query("state");

    if (!(code && state)) {
      console.error("OAuth Callback Validation Failed: Missing code or state");
      return c.redirect(
        buildRedirectUrl(
          c.env.FRONTEND_ORIGIN,
          provider,
          "error",
          "Missing authorization code or state",
        ),
      );
    }

    try {
      const payload = await verify(state, c.env.JWT_SECRET, "HS256");
      const statePayloadSchema = z.object({ sub: z.string().min(1) });
      const parsedStatePayload = statePayloadSchema.safeParse(payload);
      const userId = parsedStatePayload.success
        ? parsedStatePayload.data.sub
        : "";
      if (!userId) throw new Error("User ID not found in state");

      await runProviderCallback(
        provider,
        { env: c.env, req: { url: c.req.url } },
        code,
        userId,
      );

      return c.redirect(
        buildRedirectUrl(c.env.FRONTEND_ORIGIN, provider, "success"),
      );
    } catch (error: unknown) {
      console.error("OAuth Callback Error:", error);
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return c.redirect(
        buildRedirectUrl(c.env.FRONTEND_ORIGIN, provider, "error", message),
      );
    }
  });

  return router;
};
