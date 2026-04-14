import { describe, expect, it, vi } from "vitest";
import { fetchAuthSession } from "@/lib/auth";

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock("@/lib/client", () => ({
  client: {
    api: {
      auth: {
        session: {
          $get: getMock,
        },
      },
    },
  },
}));

describe("authApi", () => {
  it("fetchAuthSessionで認証セッションを取得できる", async () => {
    getMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ isAuthenticated: true, userId: "user-1" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await fetchAuthSession("token-1");

    expect(getMock).toHaveBeenCalled();
    expect(result).toEqual({ isAuthenticated: true, userId: "user-1" });
  });

  it("fetchAuthSessionで失敗時は例外を投げる", async () => {
    getMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(fetchAuthSession("token-1")).rejects.toThrow(
      "認証セッションの取得に失敗しました",
    );
  });
});
