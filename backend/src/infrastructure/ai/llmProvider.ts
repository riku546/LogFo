/// <reference path="../../../worker-configuration.d.ts" />
import {
  createOpenRouterProvider,
  ROADMAP_MODEL_ID,
} from "./openRouterProvider";

/**
 * 使用するLLMプロバイダーの型
 */
export type LLMProviderType = "openrouter";

/**
 * @param env - Honoの環境変数オブジェクト
 * @returns { model: any, providerName: LLMProviderType }
 */
export const getRoadmapLLM = (env: Env) => {
  const openrouter = createOpenRouterProvider(env.OPENROUTER_API_KEY);
  return {
    model: openrouter(ROADMAP_MODEL_ID),
    providerName: "openrouter" as const,
  };
};
