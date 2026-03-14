import { type LanguageModel, streamText } from "ai";
import type { PortfolioNarrativeGenerator } from "../../core/application/usecases/portfolio/generatePortfolioNarrativeUsecase";
import type { Summary } from "../../core/domain/models/summary";
import type {
  PortfolioGeneratedContent,
  PortfolioGeneratedSectionKey,
  ProfileSettings,
} from "../../schema/portfolio";
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
   * 入力コンテキストからポートフォリオ文章をストリーミング生成します。
   *
   * @param input - 生成入力
   * @returns 生成テキストのストリーム
   */
  generateStream(input: {
    profile: ProfileSettings;
    chatInput: string;
    targetSection: PortfolioGeneratedSectionKey;
    selectedSummaries: Summary[];
    currentContent: PortfolioGeneratedContent;
  }): AsyncIterable<string> {
    const result = streamText({
      model: this.model,
      system: buildPortfolioNarrativeSystemPrompt(input.targetSection),
      prompt: buildPortfolioNarrativeUserPrompt({
        profile: input.profile,
        chatInput: input.chatInput,
        targetSection: input.targetSection,
        selectedSummaries: input.selectedSummaries,
        currentContent: input.currentContent,
      }),
    });

    return result.textStream;
  }
}
