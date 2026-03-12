import { describe, expect, it, vi } from "vitest";
import type { ActivityLogRepository } from "../../src/core/application/interfaces/activityLogRepository";
import { DeleteActivityLogUsecase } from "../../src/core/application/usecases/deleteActivityLogUsecase";
import {
  ActivityLogAccessDeniedError,
  ActivityLogNotFoundError,
} from "../../src/core/application/usecases/getActivityLogsUsecase";

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

const activityLog = {
  id: "activity-1",
  userId: "user-1",
  taskId: "task-1",
  content: "content",
  loggedDate: "2026-03-12",
  createdAt: new Date("2026-03-12"),
  updatedAt: new Date("2026-03-12"),
};

describe("DeleteActivityLogUsecase", () => {
  it("所有者の場合は削除できる", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue(activityLog);
    repository.isOwner.mockResolvedValue(true);

    const usecase = new DeleteActivityLogUsecase(repository);
    await usecase.execute("activity-1", "user-1");

    expect(repository.delete).toHaveBeenCalledWith("activity-1");
  });

  it("活動記録が存在しない場合はActivityLogNotFoundError", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue(undefined);

    const usecase = new DeleteActivityLogUsecase(repository);
    await expect(usecase.execute("missing", "user-1")).rejects.toThrow(
      ActivityLogNotFoundError,
    );

    expect(repository.isOwner).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("非所有者の場合はActivityLogAccessDeniedError", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue(activityLog);
    repository.isOwner.mockResolvedValue(false);

    const usecase = new DeleteActivityLogUsecase(repository);
    await expect(usecase.execute("activity-1", "user-2")).rejects.toThrow(
      ActivityLogAccessDeniedError,
    );

    expect(repository.delete).not.toHaveBeenCalled();
  });
});
