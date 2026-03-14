import { describe, expect, it, vi } from "vitest";
import type { SummaryRepository } from "../../../src/core/application/interfaces/summaryRepository";
import {
  GeneratePortfolioNarrativeUsecase,
  type PortfolioNarrativeGenerator,
  SummarySelectionForbiddenError,
} from "../../../src/core/application/usecases/portfolio/generatePortfolioNarrativeUsecase";

const createSummaryRepository = () =>
  ({
    create: vi.fn<SummaryRepository["create"]>(),
    findByMilestoneId: vi.fn<SummaryRepository["findByMilestoneId"]>(),
    findByUserId: vi.fn<SummaryRepository["findByUserId"]>(),
    findById: vi.fn<SummaryRepository["findById"]>(),
    findByIdsForUser: vi.fn<SummaryRepository["findByIdsForUser"]>(),
    update: vi.fn<SummaryRepository["update"]>(),
    delete: vi.fn<SummaryRepository["delete"]>(),
    isOwner: vi.fn<SummaryRepository["isOwner"]>(),
  }) satisfies SummaryRepository;

const createNarrativeGenerator = () =>
  ({
    generate: vi.fn<PortfolioNarrativeGenerator["generate"]>(),
  }) satisfies PortfolioNarrativeGenerator;

describe("GeneratePortfolioNarrativeUsecase", () => {
  it("全項目生成結果を返す", async () => {
    const summaryRepository = createSummaryRepository();
    const generator = createNarrativeGenerator();

    summaryRepository.findByIdsForUser.mockResolvedValue([
      {
        id: "summary-1",
        userId: "user-1",
        milestoneId: "milestone-1",
        title: "summary",
        content: "summary content",
        createdAt: new Date("2026-03-13"),
        updatedAt: new Date("2026-03-13"),
      },
    ]);

    generator.generate.mockResolvedValue({
      selfPr: "自己PR",
      strengths: "強み",
      learnings: "学び",
      futureVision: "将来",
    });

    const usecase = new GeneratePortfolioNarrativeUsecase(
      summaryRepository,
      generator,
    );

    const result = await usecase.execute({
      userId: "user-1",
      selectedSummaryIds: ["summary-1"],
      selfPrDraft: "",
      profile: {
        displayName: "riku",
        bio: "",
        avatarUrl: "",
        socialLinks: {},
        careerStories: [],
        skills: [],
      },
      currentContent: {
        selfPr: "",
        strengths: "",
        learnings: "",
        futureVision: "",
      },
    });

    expect(result).toEqual({
      selfPr: "自己PR",
      strengths: "強み",
      learnings: "学び",
      futureVision: "将来",
    });
  });

  it("項目別再生成では対象項目のみ置き換える", async () => {
    const summaryRepository = createSummaryRepository();
    const generator = createNarrativeGenerator();

    summaryRepository.findByIdsForUser.mockResolvedValue([]);
    generator.generate.mockResolvedValue({
      selfPr: "新しい自己PR",
      strengths: "",
      learnings: "",
      futureVision: "",
    });

    const usecase = new GeneratePortfolioNarrativeUsecase(
      summaryRepository,
      generator,
    );

    const result = await usecase.execute({
      userId: "user-1",
      selectedSummaryIds: [],
      selfPrDraft: "下書きあり",
      profile: {
        displayName: "riku",
        bio: "",
        avatarUrl: "",
        socialLinks: {},
        careerStories: [],
        skills: [],
      },
      currentContent: {
        selfPr: "旧自己PR",
        strengths: "旧強み",
        learnings: "旧学び",
        futureVision: "旧将来",
      },
      targetSection: "selfPr",
    });

    expect(result).toEqual({
      selfPr: "新しい自己PR",
      strengths: "旧強み",
      learnings: "旧学び",
      futureVision: "旧将来",
    });
  });

  it("所有していないサマリーが含まれる場合はエラー", async () => {
    const summaryRepository = createSummaryRepository();
    const generator = createNarrativeGenerator();

    summaryRepository.findByIdsForUser.mockResolvedValue([
      {
        id: "summary-1",
        userId: "user-1",
        milestoneId: "milestone-1",
        title: "summary",
        content: "summary content",
        createdAt: new Date("2026-03-13"),
        updatedAt: new Date("2026-03-13"),
      },
    ]);

    const usecase = new GeneratePortfolioNarrativeUsecase(
      summaryRepository,
      generator,
    );

    await expect(
      usecase.execute({
        userId: "user-1",
        selectedSummaryIds: ["summary-1", "summary-2"],
        selfPrDraft: "",
        profile: {
          displayName: "riku",
          bio: "",
          avatarUrl: "",
          socialLinks: {},
          careerStories: [],
          skills: [],
        },
        currentContent: {
          selfPr: "",
          strengths: "",
          learnings: "",
          futureVision: "",
        },
      }),
    ).rejects.toThrow(SummarySelectionForbiddenError);
  });
});
