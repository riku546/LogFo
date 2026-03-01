import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * OpenRouter API経由でLLMモデルにアクセスするためのプロバイダーを生成します。
 *
 * @param apiKey - OpenRouter APIキー
 * @returns 設定済みのOpenRouterプロバイダーインスタンス
 */
export const createOpenRouterProvider = (apiKey: string) => {
  return createOpenRouter({
    apiKey,
  });
};

/**
 * ロードマップ生成に使用するモデルID
 */
export const ROADMAP_MODEL_ID = "arcee-ai/trinity-large-preview:free" as const;
