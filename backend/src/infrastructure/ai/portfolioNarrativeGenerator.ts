import { generateObject, type LanguageModel } from "ai";
import type { PortfolioNarrativeGenerator } from "../../core/application/usecases/portfolio/generatePortfolioNarrativeUsecase";
import type { Summary } from "../../core/domain/models/summary";
import type {
  PortfolioGeneratedContent,
  PortfolioGeneratedSectionKey,
  ProfileSettings,
} from "../../schema/portfolio";
import { portfolioGeneratedContentSchema } from "../../schema/portfolio";
import {
  buildPortfolioNarrativeSystemPrompt,
  buildPortfolioNarrativeUserPrompt,
} from "./prompts/portfolioNarrativePrompt";

/**
 * Vercel AI SDKを利用したポートフォリオ文章生成器
 */
export class AIPortfolioNarrativeGenerator
  implements PortfolioNarrativeGenerator
{
  constructor(private readonly model: LanguageModel) {}

  /**
   * 入力コンテキストからポートフォリオ文章を生成します。
   *
   * @param input - 生成入力
   * @returns 4セクションの生成結果
   */
  async generate(input: {
    profile: ProfileSettings;
    selfPrDraft: string;
    selectedSummaries: Summary[];
    currentContent: PortfolioGeneratedContent;
    targetSection?: PortfolioGeneratedSectionKey;
  }): Promise<PortfolioGeneratedContent> {
    const result = await generateObject({
      model: this.model,
      schema: portfolioGeneratedContentSchema,
      system: buildPortfolioNarrativeSystemPrompt(input.targetSection),
      prompt: buildPortfolioNarrativeUserPrompt({
        profile: input.profile,
        selfPrDraft: input.selfPrDraft,
        selectedSummaries: input.selectedSummaries,
        currentContent: input.currentContent,
      }),
    });

    return {
      selfPr: result.object.selfPr ?? "",
      strengths: result.object.strengths ?? "",
      learnings: result.object.learnings ?? "",
      futureVision: result.object.futureVision ?? "",
    };
  }
}
