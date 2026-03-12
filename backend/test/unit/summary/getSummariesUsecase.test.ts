import { describe, expect, it, vi } from "vitest";
import type { SummaryRepository } from "../../../src/core/application/interfaces/summaryRepository";
import { GetSummariesUsecase } from "../../../src/core/application/usecases/summary/getSummariesUsecase";

const createMockRepository = () =>
  ({
    create: vi.fn<SummaryRepository["create"]>(),
    findByMilestoneId: vi.fn<SummaryRepository["findByMilestoneId"]>(),
    findById: vi.fn<SummaryRepository["findById"]>(),
    update: vi.fn<SummaryRepository["update"]>(),
    delete: vi.fn<SummaryRepository["delete"]>(),
    isOwner: vi.fn<SummaryRepository["isOwner"]>(),
  }) satisfies SummaryRepository;

describe("GetSummariesUsecase", () => {
  it("マイルストーンのサマリー一覧を返す", async () => {
    const repository = createMockRepository();
    repository.findByMilestoneId.mockResolvedValue([
      {
        id: "summary-1",
        userId: "user-1",
        milestoneId: "milestone-1",
        title: "title",
        content: "content",
        createdAt: new Date("2026-03-12"),
        updatedAt: new Date("2026-03-12"),
      },
    ]);

    const usecase = new GetSummariesUsecase(repository);
    const result = await usecase.execute("milestone-1");

    expect(result).toHaveLength(1);
    expect(repository.findByMilestoneId).toHaveBeenCalledWith("milestone-1");
  });
});
