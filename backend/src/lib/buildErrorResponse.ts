import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

interface ErrorResponse {
  success: false;
  errorMessage: string;
  validationErrors?: string[];
}
//フロントエンド側に返却するエラーレスポンスを作成する
export const buildErrorResponse = (
  c: Context,
  status: ContentfulStatusCode,
  errorMessage: string,
  validationErrors?: string[],
) =>
  c.json<ErrorResponse>(
    {
      success: false,
      errorMessage,
      validationErrors,
    },
    status,
  );
