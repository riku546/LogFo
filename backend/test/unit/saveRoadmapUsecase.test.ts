import { describe, expect, it, vi } from "vitest";
import type { RoadmapRepository } from "../../src/core/application/interfaces/roadmapRepository";
import { SaveRoadmapUsecase } from "../../src/core/application/usecases/saveRoadmapUsecase";

const createMockRepository = () =>
  ({
    create: vi.fn<RoadmapRepository["create"]>(),
    findById: vi.fn<RoadmapRepository["findById"]>(),
    findByUserId: vi.fn<RoadmapRepository["findByUserId"]>(),
    update: vi.fn<RoadmapRepository["update"]>(),
    delete: vi.fn<RoadmapRepository["delete"]>(),
    isOwner: vi.fn<RoadmapRepository["isOwner"]>(),
  }) satisfies RoadmapRepository;

describe("SaveRoadmapUsecase", () => {
  it("入力を永続化フォーマットへ変換して保存する", async () => {
    const repository = createMockRepository();
    repository.create.mockResolvedValue("roadmap-1");

    const usecase = new SaveRoadmapUsecase(repository);
    const result = await usecase.execute("user-1", {
      currentState: "current",
      goalState: "goal",
      pdfContext: null,
      summary: "summary",
      milestones: [
        {
          title: "milestone",
          description: "description",
          orderIndex: 0,
          tasks: [
            {
              title: "task",
              estimatedHours: 10,
              orderIndex: 0,
            },
          ],
        },
      ],
    });

    expect(result).toBe("roadmap-1");
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        milestones: [
          expect.objectContaining({
            status: "TODO",
            tasks: [expect.objectContaining({ status: "TODO" })],
          }),
        ],
      }),
    );
  });
});
