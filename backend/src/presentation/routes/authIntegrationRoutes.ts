import { Hono } from "hono";
import { setCookie } from "hono/cookie";

export const createAuthIntegrationRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  // プロバイダ（GitHubなど）ごとのOAuth認証開始エンドポイント
  router.get("/:provider", async (c) => {
    const provider = c.req.param("provider");
    // コールバックURLを公開ルート（/auth/:provider/callback）に向けるよう調整
    // request.url (ex: https://api.example.com/api/auth/github) から origin (https://api.example.com) を取得する
    const baseUrl = new URL(c.req.url);
    const redirectUri = `${baseUrl.origin}/auth/${provider}/callback`;
    const state = crypto.randomUUID(); // CSRF対策

    // stateをCookieに保存してコールバック時に検証する（Secure等属性は環境に合わせて調整）
    setCookie(c, "oauth_state", state, {
      path: "/",
      httpOnly: true,
      secure: c.env.FRONTEND_ORIGIN.startsWith("https"),
      maxAge: 60 * 10, // 10分
    });

    if (provider === "github") {
      const clientId = c.env.GITHUB_CLIENT_ID;
      if (!clientId) return c.json({ message: "GitHub Client ID is not configured" }, 500);

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
      if (!clientId) return c.json({ message: "WakaTime App ID is not configured" }, 500);

      const wakatimeAuthUrl = new URL("https://wakatime.com/oauth/authorize");
      wakatimeAuthUrl.searchParams.set("client_id", clientId);
      wakatimeAuthUrl.searchParams.set("response_type", "code");
      wakatimeAuthUrl.searchParams.set("redirect_uri", redirectUri);
      wakatimeAuthUrl.searchParams.set("scope", "email,read_stats,read_logged_time");
      wakatimeAuthUrl.searchParams.set("state", state);

      return c.json({ redirectUrl: wakatimeAuthUrl.toString() });
    }

    return c.json({ message: `Provider ${provider} is not supported` }, 400);
  });

  return router;
};

// OAuthプロバイダからのコールバック受取用ルート（JWT認証が不要な公開ルート）
export const createAuthIntegrationCallbackRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.get("/:provider/callback", async (c) => {
    // const provider = c.req.param("provider");
    // const code = c.req.query("code");
    // const state = c.req.query("state");
    // ここで state の検証と、code を用いた Token 交換処理を行い、userIntegrations に保存する
    
    // 一時的なモック用リダイレクト先（フロントエンドの実装に応じて適宜修正）
    const frontendUrl = new URL(c.env.FRONTEND_ORIGIN);
    const provider = c.req.param("provider");
    frontendUrl.pathname = `/auth/callback/${provider}`;
    frontendUrl.searchParams.set("integration", "success");

    return c.redirect(frontendUrl.toString());
  });

  return router;
};
