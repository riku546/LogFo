import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRoadmapLLM } from "../../../../src/infrastructure/ai/llmProvider";

// 定数をモック内で使用できるように vi.hoisted で持ち上げる
const { mockWorkersAiModel, mockCreateWorkersAIProvider } = vi.hoisted(() => ({
  mockWorkersAiModel: vi.fn((modelId: string) => `workers-ai-${modelId}`),
  mockCreateWorkersAIProvider: vi.fn((aiBinding: any) => {
    return (modelId: string) => `workers-ai-${modelId}`;
  }),
}));

// モックの設定
vi.mock("../../../../src/infrastructure/ai/openRouterProvider", () => ({
  createOpenRouterProvider: vi.fn(() =>
    vi.fn((modelId: string) => `openrouter-${modelId}`),
  ),
  ROADMAP_MODEL_ID: "roadmap-model-id",
}));

vi.mock("../../../../src/infrastructure/ai/workersAiProvider", () => ({
  createWorkersAIProvider: vi.fn(() => mockWorkersAiModel),
  WORKERS_AI_MODEL_DEV: "@cf/meta/llama-3.1-8b-instruct-fast",
  WORKERS_AI_MODEL_PROD: "@cf/meta/llama-3.1-8b-instruct-fast",
}));

describe("llmProvider", () => {
  const mockEnv = {
    AI: {},
    OPENROUTER_API_KEY: "test-key",
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("デフォルトではWorkers AIが選択されること", () => {
    const { providerName } = getRoadmapLLM(mockEnv);
    expect(providerName).toBe("workers-ai");
    expect(mockWorkersAiModel).toHaveBeenCalledWith(
      "@cf/meta/llama-3.1-8b-instruct-fast",
    );
  });

  it("LLM_PROVIDER=openrouter のときOpenRouterが選択されること", () => {
    const { providerName } = getRoadmapLLM({
      ...mockEnv,
      LLM_PROVIDER: "openrouter",
    });
    expect(providerName).toBe("openrouter");
  });

  it("providerOverride引数が優先されること", () => {
    const { providerName } = getRoadmapLLM(mockEnv, "openrouter");
    expect(providerName).toBe("openrouter");
  });

  it("ENVIRONMENT=development のときでも現在は安定している 8b モデルが選択されること", () => {
    const result = getRoadmapLLM({ ...mockEnv, ENVIRONMENT: "development" });
    expect(result.providerName).toBe("workers-ai");
    expect(mockWorkersAiModel).toHaveBeenCalledWith(
      "@cf/meta/llama-3.1-8b-instruct-fast",
    );
  });
});
