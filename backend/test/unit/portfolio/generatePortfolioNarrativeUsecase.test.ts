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
    generateStream: vi.fn<PortfolioNarrativeGenerator["generateStream"]>(),
  }) satisfies PortfolioNarrativeGenerator;

const toStream = async function* (chunks: string[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
};

const collectStream = async (stream: AsyncIterable<string>) => {
  let text = "";
  for await (const chunk of stream) {
    text += chunk;
  }
  return text;
};

describe("GeneratePortfolioNarrativeUsecase", () => {
  it("ストリーミング結果を返す", async () => {
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

    generator.generateStream.mockReturnValue(toStream(["自己", "PR"]));

    const usecase = new GeneratePortfolioNarrativeUsecase(
      summaryRepository,
      generator,
    );

    const stream = await usecase.execute({
      userId: "user-1",
      selectedSummaryIds: ["summary-1"],
      chatInput: "4項目をフォーマルに生成してください",
      targetSection: "selfPr",
      currentContent: {
        selfPr: "",
        strengths: "",
        learnings: "",
        futureVision: "",
      },
    });

    await expect(collectStream(stream)).resolves.toBe("自己PR");
  });

  it("生成器ストリームをそのまま返す", async () => {
    const summaryRepository = createSummaryRepository();
    const generator = createNarrativeGenerator();

    summaryRepository.findByIdsForUser.mockResolvedValue([]);
    generator.generateStream.mockReturnValue(toStream(["新しい", "自己PR"]));

    const usecase = new GeneratePortfolioNarrativeUsecase(
      summaryRepository,
      generator,
    );

    const stream = await usecase.execute({
      userId: "user-1",
      selectedSummaryIds: [],
      chatInput: "自己PRを改善してください",
      targetSection: "selfPr",
      currentContent: {
        selfPr: "旧自己PR",
        strengths: "旧強み",
        learnings: "旧学び",
        futureVision: "旧将来",
      },
    });

    await expect(collectStream(stream)).resolves.toBe("新しい自己PR");
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
        chatInput: "自己PRを生成してください",
        targetSection: "selfPr",
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
