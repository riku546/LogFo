/// <reference path="../../../worker-configuration.d.ts" />
import { zValidator } from "@hono/zod-validator";
import { streamObject } from "ai";
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
import { getRoadmapLLM } from "../../infrastructure/ai/llmProvider";
import { buildRoadmapSystemPrompt } from "../../infrastructure/ai/prompts/roadmapSystemPrompt";
import { extractPdfText } from "../../infrastructure/pdf/pdfParser";
import { DrizzleRoadmapRepository } from "../../infrastructure/repositories/drizzleRoadmapRepository";
import { buildErrorResponse } from "../../lib/buildErrorResponse";
import { getUserIdFromJwt } from "../../lib/readJson";
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

        // ユーザーPDF抽出（存在する場合）
        let userPdfText: string | undefined;
        const userPdfFile = formData.get("userPdfFile");
        if (userPdfFile && userPdfFile instanceof File) {
          const buffer = await userPdfFile.arrayBuffer();
          userPdfText = await extractPdfText(buffer);
        }

        // 企業PDF抽出（存在する場合）
        let companyPdfText: string | undefined;
        const companyPdfFile = formData.get("companyPdfFile");
        if (companyPdfFile && companyPdfFile instanceof File) {
          const buffer = await companyPdfFile.arrayBuffer();
          companyPdfText = await extractPdfText(buffer);
        }

        // プロンプト構築
        const systemPrompt = buildRoadmapSystemPrompt(
          input,
          userPdfText,
          companyPdfText,
        );

        // LLMプロバイダーとモデルの設定取得
        const { model } = getRoadmapLLM(c.env);

        // 構造化出力をストリーミングで生成
        const result = await streamObject({
          model,
          schema: roadmapGenerationSchema,
          system: systemPrompt,
          prompt:
            "上記の情報をもとに、具体的な学習ロードマップを作成してください。",
        });

        // Vercel AI SDKが生成する標準のストリーミングレスポンス
        const streamResponse = result.toTextStreamResponse();

        // Cloudflare Workers + Hono 環境でのバッファリングを防ぐための追加ヘッダーを設定
        // 参考: https://github.com/honojs/hono/issues/1865 等
        for (const [key, value] of streamResponse.headers.entries()) {
          c.header(key, value);
        }
        c.header("X-Vercel-AI-Data-Stream", "v1");
        c.header("Content-Encoding", "identity");

        // Honoのc.bodyは型定義が厳しいため、streamとして扱う
        return new Response(streamResponse.body, {
          headers: c.res.headers,
        });
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
