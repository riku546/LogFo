import { describe, expect, it, vi } from "vitest";
import type { SummaryRepository } from "../../src/core/application/interfaces/summaryRepository";
import { SaveSummaryUsecase } from "../../src/core/application/usecases/saveSummaryUsecase";

const createMockRepository = () =>
  ({
    create: vi.fn<SummaryRepository["create"]>(),
    findByMilestoneId: vi.fn<SummaryRepository["findByMilestoneId"]>(),
    findById: vi.fn<SummaryRepository["findById"]>(),
    update: vi.fn<SummaryRepository["update"]>(),
    delete: vi.fn<SummaryRepository["delete"]>(),
    isOwner: vi.fn<SummaryRepository["isOwner"]>(),
  }) satisfies SummaryRepository;

describe("SaveSummaryUsecase", () => {
  it("サマリーを作成してIDを返す", async () => {
    const repository = createMockRepository();
    repository.create.mockResolvedValue("summary-1");

    const usecase = new SaveSummaryUsecase(repository);
    const result = await usecase.execute({
      userId: "user-1",
      milestoneId: "milestone-1",
      title: "title",
      content: "content",
    });

    expect(result).toBe("summary-1");
    expect(repository.create).toHaveBeenCalledWith({
      userId: "user-1",
      milestoneId: "milestone-1",
      title: "title",
      content: "content",
    });
  });
});
