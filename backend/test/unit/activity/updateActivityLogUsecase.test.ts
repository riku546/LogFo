import { describe, expect, it, vi } from "vitest";
import type { ActivityLogRepository } from "../../../src/core/application/interfaces/activityLogRepository";
import {
  ActivityLogAccessDeniedError,
  ActivityLogNotFoundError,
} from "../../../src/core/application/usecases/activity/getActivityLogsUsecase";
import { UpdateActivityLogUsecase } from "../../../src/core/application/usecases/activity/updateActivityLogUsecase";

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

describe("UpdateActivityLogUsecase", () => {
  it("所有者の場合は活動記録を更新できる", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      taskId: "task-1",
      content: "old",
      loggedDate: "2026-03-12",
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });
    repository.isOwner.mockResolvedValue(true);

    const usecase = new UpdateActivityLogUsecase(repository);
    await usecase.execute("activity-1", "user-1", "new content");

    expect(repository.update).toHaveBeenCalledWith("activity-1", "new content");
  });

  it("存在しない場合はActivityLogNotFoundError", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue(undefined);

    const usecase = new UpdateActivityLogUsecase(repository);
    await expect(usecase.execute("missing", "user-1", "new")).rejects.toThrow(
      ActivityLogNotFoundError,
    );
  });

  it("非所有者の場合はActivityLogAccessDeniedError", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      taskId: "task-1",
      content: "old",
      loggedDate: "2026-03-12",
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });
    repository.isOwner.mockResolvedValue(false);

    const usecase = new UpdateActivityLogUsecase(repository);
    await expect(
      usecase.execute("activity-1", "user-2", "new"),
    ).rejects.toThrow(ActivityLogAccessDeniedError);
  });
});
