import { z } from "zod";

/**
 * LLMが出力するロードマップの構造化スキーマ
 * Vercel AI SDK の `Output.object()` に渡して、ストリーミング構造化出力を強制します。
 */
export const roadmapGenerationSchema = z.object({
  summary: z
    .string()
    .describe("ユーザーの現状と目標のギャップに関する解説と学習方針"),
  milestones: z.array(
    z.object({
      title: z
        .string()
        .describe("マイルストーンの名前（例: Frontendの基礎を固める）"),
      description: z.string().describe("このマイルストーンの目的"),
      tasks: z.array(
        z.object({
          title: z
            .string()
            .describe("具体的なアクション（例: React公式ドキュメントを読む）"),
          estimatedHours: z.number().describe("予想される学習時間(時間)"),
        }),
      ),
    }),
  ),
});

/**
 * LLMが出力するロードマップの型
 */
export type RoadmapGeneration = z.infer<typeof roadmapGenerationSchema>;
