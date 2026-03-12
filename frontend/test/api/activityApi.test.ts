import { describe, expect, it, vi } from "vitest";
import {
  ActivityApiError,
  fetchActivityLogs,
} from "@/features/activity/api/activityApi";

describe("activityApi", () => {
  it("fetchActivityLogsで失敗時にActivityApiErrorを投げる", async () => {
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

    await expect(fetchActivityLogs("token", "task-1")).rejects.toBeInstanceOf(
      ActivityApiError,
    );
  });
});
