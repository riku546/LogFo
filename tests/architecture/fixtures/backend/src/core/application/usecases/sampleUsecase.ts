import { buildErrorResponse } from "../../../lib/buildErrorResponse";

/**
 * core から lib への不正依存が検出されることを確認するフィクスチャ
 */
export const sampleUsecaseFixture = () => {
  return buildErrorResponse;
};
