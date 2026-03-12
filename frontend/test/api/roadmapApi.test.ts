import { describe, expect, it, vi } from "vitest";
import {
  buildSaveRoadmapPayloadFromManualInput,
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

  it("手入力データを保存ペイロードへ変換できる", () => {
    const payload = buildSaveRoadmapPayloadFromManualInput({
      currentState: "  現在地  ",
      goalState: "  目標  ",
      summary: "  サマリー  ",
      milestones: [
        {
          title: "  マイルストーン  ",
          description: "  補足  ",
          tasks: [{ title: "  タスク  ", estimatedHours: 5 }],
        },
      ],
    });

    expect(payload).toEqual({
      currentState: "現在地",
      goalState: "目標",
      pdfContext: null,
      summary: "サマリー",
      milestones: [
        {
          title: "マイルストーン",
          description: "補足",
          orderIndex: 0,
          tasks: [
            {
              title: "タスク",
              estimatedHours: 5,
              orderIndex: 0,
            },
          ],
        },
      ],
    });
  });
});
