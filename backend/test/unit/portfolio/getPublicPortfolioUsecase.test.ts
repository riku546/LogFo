import { describe, expect, it, vi } from "vitest";
import type { PortfolioRepository } from "../../../src/core/application/interfaces/portfolioRepository";
import type { RoadmapRepository } from "../../../src/core/application/interfaces/roadmapRepository";
import type { SummaryRepository } from "../../../src/core/application/interfaces/summaryRepository";
import {
  GetPublicPortfolioUsecase,
  PortfolioNotFoundError,
  PortfolioNotPublicError,
} from "../../../src/core/application/usecases/portfolio/getPublicPortfolioUsecase";
import type { PortfolioSettings } from "../../../src/schema/portfolio";

const createPortfolioRepository = () =>
  ({
    upsert: vi.fn<PortfolioRepository["upsert"]>(),
    findByUserId: vi.fn<PortfolioRepository["findByUserId"]>(),
    findBySlug: vi.fn<PortfolioRepository["findBySlug"]>(),
    isSlugAvailable: vi.fn<PortfolioRepository["isSlugAvailable"]>(),
  }) satisfies PortfolioRepository;

const createSummaryRepository = () =>
  ({
    create: vi.fn<SummaryRepository["create"]>(),
    findByMilestoneId: vi.fn<SummaryRepository["findByMilestoneId"]>(),
    findById: vi.fn<SummaryRepository["findById"]>(),
    update: vi.fn<SummaryRepository["update"]>(),
    delete: vi.fn<SummaryRepository["delete"]>(),
    isOwner: vi.fn<SummaryRepository["isOwner"]>(),
  }) satisfies SummaryRepository;

const createRoadmapRepository = () =>
  ({
    create: vi.fn<RoadmapRepository["create"]>(),
    findById: vi.fn<RoadmapRepository["findById"]>(),
    findByUserId: vi.fn<RoadmapRepository["findByUserId"]>(),
    update: vi.fn<RoadmapRepository["update"]>(),
    delete: vi.fn<RoadmapRepository["delete"]>(),
    isOwner: vi.fn<RoadmapRepository["isOwner"]>(),
  }) satisfies RoadmapRepository;

const settings: PortfolioSettings = {
  profile: {
    displayName: "riku",
    bio: "",
    avatarUrl: "",
    socialLinks: {
      github: "",
      x: "",
      zenn: "",
      qiita: "",
      atcoder: "",
      website: "",
    },
    careerStories: [],
    skills: [],
  },
  sections: {
    summaryIds: ["summary-1", "summary-2"],
    roadmapIds: ["roadmap-1", "roadmap-2"],
  },
};

describe("GetPublicPortfolioUsecase", () => {
  it("公開ポートフォリオと関連データを返す", async () => {
    const portfolioRepository = createPortfolioRepository();
    const summaryRepository = createSummaryRepository();
    const roadmapRepository = createRoadmapRepository();

    portfolioRepository.findBySlug.mockResolvedValue({
      id: "portfolio-1",
      userId: "user-1",
      slug: "riku",
      isPublic: true,
      settings,
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });

    summaryRepository.findById
      .mockResolvedValueOnce({
        id: "summary-1",
        userId: "user-1",
        milestoneId: "milestone-1",
        title: "title",
        content: "content",
        createdAt: new Date("2026-03-12"),
        updatedAt: new Date("2026-03-12"),
      })
      .mockResolvedValueOnce(undefined);

    roadmapRepository.findById
      .mockResolvedValueOnce({
        id: "roadmap-1",
        userId: "user-1",
        currentState: "current",
        goalState: "goal",
        pdfContext: null,
        summary: "summary",
        createdAt: new Date("2026-03-12"),
        updatedAt: new Date("2026-03-12"),
        milestones: [],
      })
      .mockResolvedValueOnce(undefined);

    const usecase = new GetPublicPortfolioUsecase(
      portfolioRepository,
      summaryRepository,
      roadmapRepository,
    );

    const result = await usecase.execute("riku");
    expect(result.slug).toBe("riku");
    expect(result.summaries).toHaveLength(1);
    expect(result.roadmaps).toEqual([
      {
        id: "roadmap-1",
        currentState: "current",
        goalState: "goal",
        summary: "summary",
      },
    ]);
  });

  it("ポートフォリオが存在しない場合はPortfolioNotFoundError", async () => {
    const usecase = new GetPublicPortfolioUsecase(
      createPortfolioRepository(),
      createSummaryRepository(),
      createRoadmapRepository(),
    );

    await expect(usecase.execute("missing")).rejects.toThrow(
      PortfolioNotFoundError,
    );
  });

  it("非公開の場合はPortfolioNotPublicError", async () => {
    const portfolioRepository = createPortfolioRepository();
    portfolioRepository.findBySlug.mockResolvedValue({
      id: "portfolio-1",
      userId: "user-1",
      slug: "private",
      isPublic: false,
      settings,
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });

    const usecase = new GetPublicPortfolioUsecase(
      portfolioRepository,
      createSummaryRepository(),
      createRoadmapRepository(),
    );

    await expect(usecase.execute("private")).rejects.toThrow(
      PortfolioNotPublicError,
    );
  });
});
