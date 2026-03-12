import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

/**
 * テスト用ユーザーでJWTトークンを発行する。
 */
const getAuthToken = async (
  email = "auth-session-test@example.com",
  password = "password123",
  userName = "authSessionUser",
): Promise<string> => {
  await SELF.fetch("http://localhost:8787/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, userName }),
  });

  const signinResponse = await SELF.fetch("http://localhost:8787/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const signinBody: { token: string } = await signinResponse.json();
  return signinBody.token;
};

describe("Auth Session API Integration Test", () => {
  it("JWTありならセッション情報を返す", async () => {
    const token = await getAuthToken();
    const response = await SELF.fetch(
      "http://localhost:8787/api/auth/session",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    const body: { isAuthenticated: boolean; userId: string } =
      await response.json();
    expect(body.isAuthenticated).toBe(true);
    expect(typeof body.userId).toBe("string");
    expect(body.userId.length).toBeGreaterThan(0);
  });

  it("JWTなしなら401を返す", async () => {
    const response = await SELF.fetch(
      "http://localhost:8787/api/auth/session",
      {
        method: "GET",
      },
    );
    expect(response.status).toBe(401);
  });
});
