import { describe, expect, it, vi } from "vitest";
import type { PortfolioRepository } from "../../../src/core/application/interfaces/portfolioRepository";
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
    selectedSummaryIds: ["summary-1"],
    selfPrDraft: "",
  },
  generatedContent: {
    selfPr: "自己PR",
    strengths: "強み",
    learnings: "学び",
    futureVision: "将来",
  },
};

describe("GetPublicPortfolioUsecase", () => {
  it("公開ポートフォリオを返す", async () => {
    const portfolioRepository = createPortfolioRepository();

    portfolioRepository.findBySlug.mockResolvedValue({
      id: "portfolio-1",
      userId: "user-1",
      slug: "riku",
      isPublic: true,
      settings,
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });

    const usecase = new GetPublicPortfolioUsecase(portfolioRepository);

    const result = await usecase.execute("riku");
    expect(result.slug).toBe("riku");
    expect(result.settings.generatedContent.selfPr).toBe("自己PR");
  });

  it("ポートフォリオが存在しない場合はPortfolioNotFoundError", async () => {
    const usecase = new GetPublicPortfolioUsecase(createPortfolioRepository());

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

    const usecase = new GetPublicPortfolioUsecase(portfolioRepository);

    await expect(usecase.execute("private")).rejects.toThrow(
      PortfolioNotPublicError,
    );
  });
});
