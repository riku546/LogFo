import { describe, expect, it, vi } from "vitest";
import type { RoadmapRepository } from "../../../src/core/application/interfaces/roadmapRepository";
import {
  RoadmapAccessDeniedError,
  RoadmapNotFoundError,
} from "../../../src/core/application/usecases/roadmap/getRoadmapUsecase";
import { UpdateRoadmapUsecase } from "../../../src/core/application/usecases/roadmap/updateRoadmapUsecase";

const createMockRepository = () =>
  ({
    create: vi.fn<RoadmapRepository["create"]>(),
    findById: vi.fn<RoadmapRepository["findById"]>(),
    findByUserId: vi.fn<RoadmapRepository["findByUserId"]>(),
    update: vi.fn<RoadmapRepository["update"]>(),
    delete: vi.fn<RoadmapRepository["delete"]>(),
    isOwner: vi.fn<RoadmapRepository["isOwner"]>(),
  }) satisfies RoadmapRepository;

describe("UpdateRoadmapUsecase", () => {
  it("所有者の場合は更新できる", async () => {
    const repository = createMockRepository();
    repository.isOwner.mockResolvedValue(true);

    const usecase = new UpdateRoadmapUsecase(repository);
    await usecase.execute("roadmap-1", "user-1", {
      currentState: "current",
      goalState: "goal",
      pdfContext: null,
      summary: "summary",
      milestones: [
        {
          id: "milestone-1",
          title: "milestone",
          description: null,
          status: "TODO",
          orderIndex: 0,
          tasks: [
            {
              id: "task-1",
              title: "task",
              estimatedHours: 3,
              status: "DONE",
              orderIndex: 0,
            },
          ],
        },
      ],
    });

    expect(repository.update).toHaveBeenCalledWith(
      "roadmap-1",
      expect.objectContaining({
        userId: "user-1",
        milestones: [
          expect.objectContaining({
            tasks: [expect.objectContaining({ status: "DONE" })],
          }),
        ],
      }),
    );
  });

  it("存在しない場合はRoadmapNotFoundError", async () => {
    const repository = createMockRepository();
    repository.isOwner.mockResolvedValue(false);
    repository.findById.mockResolvedValue(undefined);

    const usecase = new UpdateRoadmapUsecase(repository);
    await expect(
      usecase.execute("missing", "user-1", {
        currentState: "current",
        goalState: "goal",
        pdfContext: null,
        summary: null,
        milestones: [],
      }),
    ).rejects.toThrow(RoadmapNotFoundError);
  });

  it("非所有者の場合はRoadmapAccessDeniedError", async () => {
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

    const usecase = new UpdateRoadmapUsecase(repository);
    await expect(
      usecase.execute("roadmap-1", "user-1", {
        currentState: "current",
        goalState: "goal",
        pdfContext: null,
        summary: null,
        milestones: [],
      }),
    ).rejects.toThrow(RoadmapAccessDeniedError);
  });
});
