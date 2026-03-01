import { zValidator } from "@hono/zod-validator";
import { Output, streamText } from "ai";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { DeleteRoadmapUsecase } from "../../core/application/usecases/deleteRoadmapUsecase";
import {
  GetRoadmapUsecase,
  RoadmapAccessDeniedError,
  RoadmapNotFoundError,
} from "../../core/application/usecases/getRoadmapUsecase";
import { SaveRoadmapUsecase } from "../../core/application/usecases/saveRoadmapUsecase";
import { UpdateRoadmapUsecase } from "../../core/application/usecases/updateRoadmapUsecase";
import {
  createOpenRouterProvider,
  ROADMAP_MODEL_ID,
} from "../../infrastructure/ai/openRouterProvider";
import { buildRoadmapSystemPrompt } from "../../infrastructure/ai/prompts/roadmapSystemPrompt";
import { extractPdfText } from "../../infrastructure/pdf/pdfParser";
import { DrizzleRoadmapRepository } from "../../infrastructure/repositories/drizzleRoadmapRepository";
import { buildErrorResponse } from "../../lib/buildErrorResponse";
import {
  generateRoadmapRequestSchema,
  saveRoadmapRequestSchema,
  updateRoadmapRequestSchema,
} from "../../schema/roadmap";
import { roadmapGenerationSchema } from "../../schema/roadmapGeneration";

/**
 * ドメインエラーをHTTPExceptionに変換するヘルパー関数
 */
const handleDomainError = (error: unknown): never => {
  if (error instanceof RoadmapNotFoundError) {
    throw new HTTPException(404, { message: error.message });
  }
  if (error instanceof RoadmapAccessDeniedError) {
    throw new HTTPException(403, { message: error.message });
  }
  throw error;
};

/**
 * JWTペイロードからユーザーIDを取得するヘルパー関数
 *
 * @param c - Honoのコンテキスト
 * @returns ユーザーID
 * @throws {HTTPException} JWTペイロードにユーザーIDがない場合
 */
const getUserIdFromJwt = (c: { get: (key: string) => unknown }): string => {
  const jwtPayload = c.get("jwtPayload") as { sub?: string } | undefined;
  if (!jwtPayload?.sub) {
    throw new HTTPException(401, { message: "Invalid token" });
  }
  return jwtPayload.sub;
};

/**
 * ロードマップ関連のHonoルーティングを生成するファクトリ関数
 *
 * @returns ロードマップルートが定義されたHonoアプリインスタンス
 */
export const createRoadmapRoutes = () => {
  return (
    new Hono<{ Bindings: Env }>()
      // ===== ロードマップ生成 (Streaming API) =====
      .post("/generate", async (c) => {
        // FormDataからデータを取得
        const formData = await c.req.formData();
        const jsonData = formData.get("data");
        if (!jsonData || typeof jsonData !== "string") {
          throw new HTTPException(400, {
            message: "リクエストデータが不正です",
          });
        }

        const parseResult = generateRoadmapRequestSchema.safeParse(
          JSON.parse(jsonData),
        );
        if (!parseResult.success) {
          return buildErrorResponse(
            c,
            400,
            "Validation Error",
            parseResult.error.issues.map((issue) => issue.message),
          );
        }
        const input = parseResult.data;

        // PDF抽出（存在する場合）
        let pdfText: string | undefined;
        const pdfFile = formData.get("pdfFile");
        if (pdfFile && pdfFile instanceof File) {
          const buffer = await pdfFile.arrayBuffer();
          pdfText = await extractPdfText(buffer);
        }

        // プロンプト構築
        const systemPrompt = buildRoadmapSystemPrompt(input, pdfText);

        // OpenRouterプロバイダー設定
        const openrouter = createOpenRouterProvider(c.env.OPENROUTER_API_KEY);

        // ストリーミング構造化出力を生成
        const result = streamText({
          model: openrouter(ROADMAP_MODEL_ID),
          output: Output.object({ schema: roadmapGenerationSchema }),
          system: systemPrompt,
          prompt:
            "上記の情報をもとに、具体的な学習ロードマップを作成してください。",
        });

        return result.toTextStreamResponse();
      })

      // ===== ロードマップ保存 =====
      .post(
        "/",
        zValidator("json", saveRoadmapRequestSchema, (result, c) => {
          if (!result.success) {
            return buildErrorResponse(
              c,
              400,
              "Validation Error",
              result.error.issues.map((issue) => issue.message),
            );
          }
        }),
        async (c) => {
          const userId = getUserIdFromJwt(c);
          const input = c.req.valid("json");

          const db = drizzle(c.env.DB);
          const roadmapRepository = new DrizzleRoadmapRepository(db);
          const usecase = new SaveRoadmapUsecase(roadmapRepository);

          const roadmapId = await usecase.execute(userId, input);

          return c.json({ roadmapId }, 201);
        },
      )

      // ===== ロードマップ一覧取得 =====
      .get("/", async (c) => {
        const userId = getUserIdFromJwt(c);

        const db = drizzle(c.env.DB);
        const roadmapRepository = new DrizzleRoadmapRepository(db);
        const roadmapList = await roadmapRepository.findByUserId(userId);

        return c.json({ roadmaps: roadmapList });
      })

      // ===== ロードマップ詳細取得 =====
      .get("/:id", async (c) => {
        const userId = getUserIdFromJwt(c);
        const roadmapId = c.req.param("id");

        const db = drizzle(c.env.DB);
        const roadmapRepository = new DrizzleRoadmapRepository(db);
        const usecase = new GetRoadmapUsecase(roadmapRepository);

        try {
          const roadmap = await usecase.execute(roadmapId, userId);
          return c.json({ roadmap });
        } catch (error) {
          handleDomainError(error);
        }
      })

      // ===== ロードマップ更新 =====
      .put(
        "/:id",
        zValidator("json", updateRoadmapRequestSchema, (result, c) => {
          if (!result.success) {
            return buildErrorResponse(
              c,
              400,
              "Validation Error",
              result.error.issues.map((issue) => issue.message),
            );
          }
        }),
        async (c) => {
          const userId = getUserIdFromJwt(c);
          const roadmapId = c.req.param("id");
          const input = c.req.valid("json");

          const db = drizzle(c.env.DB);
          const roadmapRepository = new DrizzleRoadmapRepository(db);
          const usecase = new UpdateRoadmapUsecase(roadmapRepository);

          try {
            await usecase.execute(roadmapId, userId, input);
            return c.json({ message: "Roadmap updated successfully" });
          } catch (error) {
            handleDomainError(error);
          }
        },
      )

      // ===== ロードマップ削除 =====
      .delete("/:id", async (c) => {
        const userId = getUserIdFromJwt(c);
        const roadmapId = c.req.param("id");

        const db = drizzle(c.env.DB);
        const roadmapRepository = new DrizzleRoadmapRepository(db);
        const usecase = new DeleteRoadmapUsecase(roadmapRepository);

        try {
          await usecase.execute(roadmapId, userId);
          return c.json({ message: "Roadmap deleted successfully" });
        } catch (error) {
          handleDomainError(error);
        }
      })
  );
};
