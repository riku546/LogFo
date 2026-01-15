import { env } from "cloudflare:test";
import { sign } from "hono/utils/jwt/jwt";

export const createAuthToken = async () => {
  const payload = {
    sub: "test-user-id",
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間後に期限切れ
  };

  const token = await sign(payload, env.JWT_SECRET);

  return token;
};
