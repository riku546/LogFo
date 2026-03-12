import { describe, expect, it, vi } from "vitest";
import type { RoadmapRepository } from "../../../src/core/application/interfaces/roadmapRepository";
import { DeleteRoadmapUsecase } from "../../../src/core/application/usecases/roadmap/deleteRoadmapUsecase";
import {
  RoadmapAccessDeniedError,
  RoadmapNotFoundError,
} from "../../../src/core/application/usecases/roadmap/getRoadmapUsecase";

const createMockRepository = () =>
  ({
    create: vi.fn<RoadmapRepository["create"]>(),
    findById: vi.fn<RoadmapRepository["findById"]>(),
    findByUserId: vi.fn<RoadmapRepository["findByUserId"]>(),
    update: vi.fn<RoadmapRepository["update"]>(),
    delete: vi.fn<RoadmapRepository["delete"]>(),
    isOwner: vi.fn<RoadmapRepository["isOwner"]>(),
  }) satisfies RoadmapRepository;

describe("DeleteRoadmapUsecase", () => {
  it("所有者の場合は削除できる", async () => {
    const repository = createMockRepository();
    repository.isOwner.mockResolvedValue(true);

    const usecase = new DeleteRoadmapUsecase(repository);
    await usecase.execute("roadmap-1", "user-1");

    expect(repository.delete).toHaveBeenCalledWith("roadmap-1");
  });

  it("ロードマップが存在しない場合はRoadmapNotFoundError", async () => {
    const repository = createMockRepository();
    repository.isOwner.mockResolvedValue(false);
    repository.findById.mockResolvedValue(undefined);

    const usecase = new DeleteRoadmapUsecase(repository);
    await expect(usecase.execute("missing", "user-1")).rejects.toThrow(
      RoadmapNotFoundError,
    );
  });

  it("非所有者で存在する場合はRoadmapAccessDeniedError", async () => {
    const repository = createMockRepository();
    repository.isOwner.mockResolvedValue(false);
    repository.findById.mockResolvedValue({
      id: "roadmap-1",
      userId: "user-2",
      currentState: "current",
      goalState: "goal",
      pdfContext: null,
      summary: null,
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
      milestones: [],
    });

    const usecase = new DeleteRoadmapUsecase(repository);
    await expect(usecase.execute("roadmap-1", "user-1")).rejects.toThrow(
      RoadmapAccessDeniedError,
    );

    expect(repository.delete).not.toHaveBeenCalled();
  });
});
