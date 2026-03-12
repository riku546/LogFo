import { describe, expect, it, vi } from "vitest";
import type { ActivityLogRepository } from "../../../src/core/application/interfaces/activityLogRepository";
import { CreateActivityLogUsecase } from "../../../src/core/application/usecases/activity/createActivityLogUsecase";

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

describe("CreateActivityLogUsecase", () => {
  it("活動記録を作成してIDを返す", async () => {
    const repository = createMockRepository();
    repository.create.mockResolvedValue("activity-1");

    const usecase = new CreateActivityLogUsecase(repository);
    const result = await usecase.execute({
      userId: "user-1",
      taskId: "task-1",
      content: "学習メモ",
      loggedDate: "2026-03-12",
    });

    expect(result).toBe("activity-1");
    expect(repository.create).toHaveBeenCalledWith({
      userId: "user-1",
      taskId: "task-1",
      content: "学習メモ",
      loggedDate: "2026-03-12",
    });
  });
});
