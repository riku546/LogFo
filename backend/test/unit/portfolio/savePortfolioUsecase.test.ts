import { describe, expect, it, vi } from "vitest";
import type { PortfolioRepository } from "../../../src/core/application/interfaces/portfolioRepository";
import {
  SavePortfolioUsecase,
  SlugAlreadyTakenError,
} from "../../../src/core/application/usecases/portfolio/savePortfolioUsecase";
import type { PortfolioSettings } from "../../../src/schema/portfolio";

const createMockRepository = () =>
  ({
    upsert: vi.fn<PortfolioRepository["upsert"]>(),
    findByUserId: vi.fn<PortfolioRepository["findByUserId"]>(),
    findBySlug: vi.fn<PortfolioRepository["findBySlug"]>(),
    isSlugAvailable: vi.fn<PortfolioRepository["isSlugAvailable"]>(),
  }) satisfies PortfolioRepository;

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
  generation: {
    selectedSummaryIds: [],
    selfPrDraft: "",
  },
  generatedContent: {
    selfPr: "",
    strengths: "",
    learnings: "",
    futureVision: "",
  },
};

describe("SavePortfolioUsecase", () => {
  it("slugが利用可能なら保存できる", async () => {
    const repository = createMockRepository();
    repository.isSlugAvailable.mockResolvedValue(true);
    repository.upsert.mockResolvedValue("portfolio-1");

    const usecase = new SavePortfolioUsecase(repository);
    const result = await usecase.execute({
      userId: "user-1",
      slug: "riku",
      isPublic: true,
      settings,
    });

    expect(result).toBe("portfolio-1");
    expect(repository.isSlugAvailable).toHaveBeenCalledWith("riku", "user-1");
  });

  it("slugが重複している場合はSlugAlreadyTakenError", async () => {
    const repository = createMockRepository();
    repository.isSlugAvailable.mockResolvedValue(false);

    const usecase = new SavePortfolioUsecase(repository);
    await expect(
      usecase.execute({
        userId: "user-1",
        slug: "riku",
        isPublic: false,
        settings,
      }),
    ).rejects.toThrow(SlugAlreadyTakenError);

    expect(repository.upsert).not.toHaveBeenCalled();
  });
});
