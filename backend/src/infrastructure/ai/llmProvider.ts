/// <reference path="../../../worker-configuration.d.ts" />
import {
  createOpenRouterProvider,
  ROADMAP_MODEL_ID,
} from "./openRouterProvider";
import { createWorkersAIProvider, WORKERS_AI_MODEL } from "./workersAiProvider";

/**
 * 使用するLLMプロバイダーの型
 */
export type LLMProviderType = "workers-ai" | "openrouter";

/**
 * 環境、環境変数、「プロバイダー指定」に基づいて、
 * 最適なLLMプロバイダーとモデルインスタンスを取得します。
 *
 * @param env - Honoの環境変数オブジェクト
 * @param providerOverride - 手動でプロバイダーを指定する場合に使用
 * @returns { model: any, providerName: LLMProviderType }
 */
export const getRoadmapLLM = (env: Env, providerOverride?: LLMProviderType) => {
  // 決定ロジック:
  // 1. providerOverride (引数)
  // 2. env.LLM_PROVIDER (環境変数)
  // 3. デフォルト (workers-ai)
  const provider = providerOverride || env.LLM_PROVIDER || "workers-ai";

  if (provider === "openrouter") {
    const openrouter = createOpenRouterProvider(env.OPENROUTER_API_KEY);
    return {
      model: openrouter(ROADMAP_MODEL_ID),
      providerName: "openrouter" as const,
    };
  }

  // デフォルト: Workers AI
  const workersAi = createWorkersAIProvider(env.AI);

  return {
    model: workersAi(WORKERS_AI_MODEL),
    providerName: "workers-ai" as const,
  };
};
