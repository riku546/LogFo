import { describe, expect, it, vi } from "vitest";
import { fetchIntegrationRedirectUrl } from "@/features/dashboard/api/dashboardComponents";

describe("dashboardComponents API", () => {
  it("redirectUrlが無い場合はエラーを投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({}), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    await expect(
      fetchIntegrationRedirectUrl("token", "github"),
    ).rejects.toThrow("Failed to get authorization url");
  });
});
