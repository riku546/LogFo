import { describe, expect, it, vi } from "vitest";
import {
  SummaryApiError,
  saveSummary,
  summaryGenerateFetch,
} from "@/features/summary/api/summaryApi";

describe("summaryApi", () => {
  it("saveSummaryで失敗時にSummaryApiErrorを投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: "error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    await expect(
      saveSummary("token", {
        milestoneId: "milestone-1",
        title: "title",
        content: "content",
      }),
    ).rejects.toBeInstanceOf(SummaryApiError);
  });

  it("summaryGenerateFetchはoptions未指定時にfetchをそのまま呼ぶ", async () => {
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("http://localhost/test", { method: "POST" });
    const response = await summaryGenerateFetch(request, { method: "POST" });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(request, { method: "POST" });
  });
});
