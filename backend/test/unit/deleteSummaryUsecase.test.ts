import { describe, expect, it, vi } from "vitest";
import type { SummaryRepository } from "../../src/core/application/interfaces/summaryRepository";
import { DeleteSummaryUsecase } from "../../src/core/application/usecases/deleteSummaryUsecase";
import {
  SummaryAccessDeniedError,
  SummaryNotFoundError,
} from "../../src/core/application/usecases/getSummariesUsecase";

const createMockRepository = () =>
  ({
    create: vi.fn<SummaryRepository["create"]>(),
    findByMilestoneId: vi.fn<SummaryRepository["findByMilestoneId"]>(),
    findById: vi.fn<SummaryRepository["findById"]>(),
    update: vi.fn<SummaryRepository["update"]>(),
    delete: vi.fn<SummaryRepository["delete"]>(),
    isOwner: vi.fn<SummaryRepository["isOwner"]>(),
  }) satisfies SummaryRepository;

describe("DeleteSummaryUsecase", () => {
  it("所有者の場合は削除できる", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue({
      id: "summary-1",
      userId: "user-1",
      milestoneId: "milestone-1",
      title: "title",
      content: "content",
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });
    repository.isOwner.mockResolvedValue(true);

    const usecase = new DeleteSummaryUsecase(repository);
    await usecase.execute("summary-1", "user-1");

    expect(repository.delete).toHaveBeenCalledWith("summary-1");
  });

  it("サマリーが存在しない場合はSummaryNotFoundError", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue(undefined);

    const usecase = new DeleteSummaryUsecase(repository);
    await expect(usecase.execute("missing", "user-1")).rejects.toThrow(
      SummaryNotFoundError,
    );
  });

  it("非所有者の場合はSummaryAccessDeniedError", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue({
      id: "summary-1",
      userId: "user-2",
      milestoneId: "milestone-1",
      title: "title",
      content: "content",
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });
    repository.isOwner.mockResolvedValue(false);

    const usecase = new DeleteSummaryUsecase(repository);
    await expect(usecase.execute("summary-1", "user-1")).rejects.toThrow(
      SummaryAccessDeniedError,
    );
  });
});
