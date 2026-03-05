/// <reference path="../../../worker-configuration.d.ts" />
import {
  createOpenRouterProvider,
  ROADMAP_MODEL_ID,
  SUMMARY_MODEL_ID,
} from "./openRouterProvider";

/**
 * 使用するLLMプロバイダーの型
 */
export type LLMProviderType = "openrouter";

/**
 * ロードマップ生成用のLLM設定を取得します。
 *
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

/**
 * サマリー生成用のLLM設定を取得します。
 *
 * @param env - Honoの環境変数オブジェクト
 * @returns { model: any, providerName: LLMProviderType }
 */
export const getSummaryLLM = (env: Env) => {
  const openrouter = createOpenRouterProvider(env.OPENROUTER_API_KEY);
  return {
    model: openrouter(SUMMARY_MODEL_ID),
    providerName: "openrouter" as const,
  };
};
