import { describe, expect, it, vi } from "vitest";
import {
  fetchRoadmapList,
  RoadmapApiError,
  roadmapGenerateFetch,
} from "@/features/roadmap/api/roadmapApi";

describe("roadmapApi", () => {
  it("fetchRoadmapListで失敗時にRoadmapApiErrorを投げる", async () => {
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

    await expect(fetchRoadmapList("token")).rejects.toBeInstanceOf(
      RoadmapApiError,
    );
  });

  it("roadmapGenerateFetchはoptions未指定時にfetchをそのまま呼ぶ", async () => {
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("http://localhost/test", { method: "POST" });
    const response = await roadmapGenerateFetch(request, { method: "POST" });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(request, { method: "POST" });
  });
});
