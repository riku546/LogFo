import { describe, expect, it, vi } from "vitest";
import type { SummaryRepository } from "../../../src/core/application/interfaces/summaryRepository";
import {
  SummaryAccessDeniedError,
  SummaryNotFoundError,
} from "../../../src/core/application/usecases/summary/getSummariesUsecase";
import { UpdateSummaryUsecase } from "../../../src/core/application/usecases/summary/updateSummaryUsecase";

const createMockRepository = () =>
  ({
    create: vi.fn<SummaryRepository["create"]>(),
    findByMilestoneId: vi.fn<SummaryRepository["findByMilestoneId"]>(),
    findById: vi.fn<SummaryRepository["findById"]>(),
    update: vi.fn<SummaryRepository["update"]>(),
    delete: vi.fn<SummaryRepository["delete"]>(),
    isOwner: vi.fn<SummaryRepository["isOwner"]>(),
  }) satisfies SummaryRepository;

describe("UpdateSummaryUsecase", () => {
  it("所有者の場合はサマリーを更新できる", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue({
      id: "summary-1",
      userId: "user-1",
      milestoneId: "milestone-1",
      title: "old",
      content: "old",
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });
    repository.isOwner.mockResolvedValue(true);

    const usecase = new UpdateSummaryUsecase(repository);
    await usecase.execute("summary-1", "user-1", "new", "new-content");

    expect(repository.update).toHaveBeenCalledWith(
      "summary-1",
      "new",
      "new-content",
    );
  });

  it("存在しない場合はSummaryNotFoundError", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue(undefined);

    const usecase = new UpdateSummaryUsecase(repository);
    await expect(
      usecase.execute("missing", "user-1", "title", "content"),
    ).rejects.toThrow(SummaryNotFoundError);
  });

  it("非所有者の場合はSummaryAccessDeniedError", async () => {
    const repository = createMockRepository();
    repository.findById.mockResolvedValue({
      id: "summary-1",
      userId: "user-2",
      milestoneId: "milestone-1",
      title: "old",
      content: "old",
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });
    repository.isOwner.mockResolvedValue(false);

    const usecase = new UpdateSummaryUsecase(repository);
    await expect(
      usecase.execute("summary-1", "user-1", "title", "content"),
    ).rejects.toThrow(SummaryAccessDeniedError);
  });
});
