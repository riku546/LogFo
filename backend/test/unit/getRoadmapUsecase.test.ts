import { describe, expect, it, vi } from "vitest";
import type { RoadmapRepository } from "../../src/core/application/interfaces/roadmapRepository";
import {
  GetRoadmapUsecase,
  RoadmapAccessDeniedError,
  RoadmapNotFoundError,
} from "../../src/core/application/usecases/getRoadmapUsecase";

const createMockRepository = () =>
  ({
    create: vi.fn<RoadmapRepository["create"]>(),
    findById: vi.fn<RoadmapRepository["findById"]>(),
    findByUserId: vi.fn<RoadmapRepository["findByUserId"]>(),
    update: vi.fn<RoadmapRepository["update"]>(),
    delete: vi.fn<RoadmapRepository["delete"]>(),
    isOwner: vi.fn<RoadmapRepository["isOwner"]>(),
  }) satisfies RoadmapRepository;

const roadmap = {
  id: "roadmap-1",
  userId: "user-1",
  currentState: "current",
  goalState: "goal",
  pdfContext: null,
  summary: null,
  createdAt: new Date("2026-03-12"),
  updatedAt: new Date("2026-03-12"),
  milestones: [],
};

describe("GetRoadmapUsecase", () => {
  it("所有者ならロードマップを返す", async () => {
    const repository = createMockRepository();
    repository.isOwner.mockResolvedValue(true);
    repository.findById.mockResolvedValue(roadmap);

    const usecase = new GetRoadmapUsecase(repository);
    const result = await usecase.execute("roadmap-1", "user-1");

    expect(result.id).toBe("roadmap-1");
  });

  it("存在しない場合はRoadmapNotFoundError", async () => {
    const repository = createMockRepository();
    repository.isOwner.mockResolvedValue(false);
    repository.findById.mockResolvedValue(undefined);

    const usecase = new GetRoadmapUsecase(repository);
    await expect(usecase.execute("missing", "user-1")).rejects.toThrow(
      RoadmapNotFoundError,
    );
  });

  it("非所有者で存在する場合はRoadmapAccessDeniedError", async () => {
    const repository = createMockRepository();
    repository.isOwner.mockResolvedValue(false);
    repository.findById.mockResolvedValue(roadmap);

    const usecase = new GetRoadmapUsecase(repository);
    await expect(usecase.execute("roadmap-1", "user-2")).rejects.toThrow(
      RoadmapAccessDeniedError,
    );
  });
});
