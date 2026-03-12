import { client } from "@/lib/client";

export interface AuthSessionResponse {
  isAuthenticated: true;
  userId: string;
}

/**
 * 現在のJWTが有効かを確認し、認証済みユーザー情報を取得する。
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
