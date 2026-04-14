import { client } from "@/lib/client";

/**
 * 認証セッション確認APIのレスポンス
 */
export interface AuthSessionResponse {
  isAuthenticated: true;
  userId: string;
}

/**
 * 現在のJWTが有効かを確認し、認証済みユーザー情報を取得する。
 *
 * @param token - 認証済みユーザーのJWT
 * @returns 認証済みユーザー情報
 * @throws {Error} 認証セッションの取得に失敗した場合
 */
export const fetchAuthSession = async (
  token: string,
): Promise<AuthSessionResponse> => {
  const response = await client.api.auth.session.$get(
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("認証セッションの取得に失敗しました");
  }

  return (await response.json()) as AuthSessionResponse;
};
