import { describe, expect, it, vi } from "vitest";
import type { ActivityLogRepository } from "../../src/core/application/interfaces/activityLogRepository";
import { GetActivityLogsUsecase } from "../../src/core/application/usecases/getActivityLogsUsecase";

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

describe("GetActivityLogsUsecase", () => {
  it("タスクに紐づく活動記録をそのまま返す", async () => {
    const repository = createMockRepository();
    repository.findByTaskId.mockResolvedValue([
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

    const usecase = new GetActivityLogsUsecase(repository);
    const result = await usecase.execute("task-1");

    expect(result).toHaveLength(1);
    expect(repository.findByTaskId).toHaveBeenCalledWith("task-1");
  });
});
