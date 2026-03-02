/// <reference path="../../../worker-configuration.d.ts" />
import { createWorkersAI } from "workers-ai-provider";

/**
 * Cloudflare Workers AI経由でLLMモデルにアクセスするためのプロバイダーを生成します。
 *
 * @param aiBinding - Cloudflare AIバインディング
 * @returns 設定済みのWorkers AIプロバイダーインスタンス
 */
export const createWorkersAIProvider = (aiBinding: Env["AI"]) => {
  return createWorkersAI({
    binding: aiBinding,
  });
};

export const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast" as const;
