import { describe, expect, it, vi } from "vitest";
import type { ActivityLogRepository } from "../../../src/core/application/interfaces/activityLogRepository";
import {
  GenerateSummaryUsecase,
  NoActivityLogsError,
} from "../../../src/core/application/usecases/summary/generateSummaryUsecase";

const createMockRepository = () =>
  ({
    create: vi.fn<ActivityLogRepository["create"]>(),
    findByTaskId: vi.fn<ActivityLogRepository["findByTaskId"]>(),
    findById: vi.fn<ActivityLogRepository["findById"]>(),
    update: vi.fn<ActivityLogRepository["update"]>(),
    delete: vi.fn<ActivityLogRepository["delete"]>(),
    isOwner: vi.fn<ActivityLogRepository["isOwner"]>(),
    findByMilestoneId: vi.fn<ActivityLogRepository["findByMilestoneId"]>(),
  }) satisfies ActivityLogRepository;

describe("GenerateSummaryUsecase", () => {
  it("活動記録が存在する場合は生成コンテキストを返す", async () => {
    const repository = createMockRepository();
    repository.findByMilestoneId.mockResolvedValue([
      {
        id: "activity-1",
        userId: "user-1",
        taskId: "task-1",
        content: "学習ログ",
        loggedDate: "2026-03-12",
        createdAt: new Date("2026-03-12"),
        updatedAt: new Date("2026-03-12"),
      },
    ]);

    const usecase = new GenerateSummaryUsecase(repository);
    const result = await usecase.execute("milestone-1");

    expect(result.milestoneId).toBe("milestone-1");
    expect(result.activityLogs).toHaveLength(1);
  });

  it("活動記録が0件の場合はNoActivityLogsError", async () => {
    const repository = createMockRepository();
    repository.findByMilestoneId.mockResolvedValue([]);

    const usecase = new GenerateSummaryUsecase(repository);
    await expect(usecase.execute("milestone-1")).rejects.toThrow(
      NoActivityLogsError,
    );
  });
});
