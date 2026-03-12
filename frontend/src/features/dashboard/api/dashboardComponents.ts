import useSWR, { useSWRConfig } from "swr";
import { client } from "@/lib/client";

type DashboardError = { message?: string };
type ProviderWidgetsResponse = {
  widgetsData: Record<
    string,
    {
      last10Days: { date: string; count: number }[];
      batteryLevel: number;
    }
  >;
};
type DashboardStatsResponse = {
  stats: {
    totalActivities: number;
    providerDistribution: Record<string, number>;
  };
};
type IntegrationStatusResponse = {
  integrations: Array<{
    provider: string;
    connected: boolean;
  }>;
};
type SyncResponse = { message: string; syncedItemsCount: number };
type UnauthorizedError = Error & { status: number; provider: string };
/**
 * 外部サービス連携で扱うプロバイダーID
 */
export type IntegrationProvider =
  | "github"
  | "wakatime"
  | "qiita"
  | "zenn"
  | "atcoder";

const createUnauthorizedError = (
  provider: string,
  fallbackProvider: string,
): UnauthorizedError => {
  const error = new Error("Unauthorized");
  return Object.assign(error, {
    status: 401,
    provider: provider || fallbackProvider,
  });
};

const toDashboardError = (value: unknown): DashboardError => {
  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    (typeof value.message === "string" || typeof value.message === "undefined")
  ) {
    return { message: value.message };
  }
  return {};
};

const toProviderError = (value: unknown): { provider?: string } => {
  if (
    typeof value === "object" &&
    value !== null &&
    "provider" in value &&
    (typeof value.provider === "string" ||
      typeof value.provider === "undefined")
  ) {
    return { provider: value.provider };
  }
  return {};
};

const getAuthorizationHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

/**
 * クライアントサイドでのみトークンを取得する簡易フック
 */
const useToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * プロバイダー別活動ウィジェット用データを取得する SWR Hook
 */
export const useGetProviderWidgetsQuery = () => {
  const token = useToken();

  const { data, error, isLoading, mutate } = useSWR<ProviderWidgetsResponse>(
    token ? ["dashboard-provider-widgets", token] : null,
    async ([_, currentToken]: [string, string]) => {
      const response = await client.api.dashboard["provider-widgets"].$get(
        {},
        {
          headers: getAuthorizationHeader(currentToken),
        },
      );

      if (!response.ok) {
        const errorInfo = toDashboardError(
          await response.json().catch(() => ({})),
        );
        throw new Error(
          errorInfo.message || "An error occurred while fetching the data.",
        );
      }

      const data: ProviderWidgetsResponse = await response.json();
      return data;
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

/**
 * 統計情報を取得する SWR Hook
 */
export const useGetDashboardStatsQuery = () => {
  const token = useToken();

  const { data, error, isLoading, mutate } = useSWR<DashboardStatsResponse>(
    token ? ["dashboard-stats", token] : null,
    async ([_, currentToken]: [string, string]) => {
      const response = await client.api.dashboard.stats.$get(
        {},
        {
          headers: getAuthorizationHeader(currentToken),
        },
      );

      if (!response.ok) {
        const errorInfo = toDashboardError(
          await response.json().catch(() => ({})),
        );
        throw new Error(
          errorInfo.message || "An error occurred while fetching the data.",
        );
      }

      const data: DashboardStatsResponse = await response.json();
      return data;
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

/**
 * 外部サービス連携状況を取得する SWR Hook
 */
export const useGetIntegrationStatusQuery = () => {
  const token = useToken();

  const { data, error, isLoading, mutate } = useSWR<IntegrationStatusResponse>(
    token ? ["integration-status", token] : null,
    async ([_, currentToken]: [string, string]) => {
      const response = await client.api.auth.status.$get(
        {},
        {
          headers: getAuthorizationHeader(currentToken),
        },
      );

      if (!response.ok) {
        const errorInfo = toDashboardError(
          await response.json().catch(() => ({})),
        );
        throw new Error(
          errorInfo.message || "An error occurred while fetching the data.",
        );
      }

      const data: IntegrationStatusResponse = await response.json();
      return data;
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

/**
 * OAuth連携開始用のリダイレクトURLを取得する
 */
export const fetchIntegrationRedirectUrl = async (
  token: string,
  provider: string,
): Promise<string> => {
  const response = await client.api.auth[":provider"].$get(
    {
      param: { provider },
    },
    { headers: getAuthorizationHeader(token) },
  );

  if (!response.ok) {
    const errorData = toDashboardError(await response.json().catch(() => ({})));
    throw new Error(errorData.message || "Failed to get authorization url");
  }

  const data: { redirectUrl?: string } = await response.json();
  if (!data.redirectUrl) {
    throw new Error("Failed to get authorization url");
  }

  return data.redirectUrl;
};

/**
 * 手動同期を実行するフック（SWR の mutate を使用して関連キャッシュを破棄）
 */
export const useSyncExternalData = () => {
  const token = useToken();
  const { mutate } = useSWRConfig();

  const syncData = async (provider: IntegrationProvider) => {
    if (!token) throw new Error("Unauthorized");

    const response = await client.api.dashboard.sync[":provider"].$post(
      {
        param: { provider },
      },
      { headers: getAuthorizationHeader(token) },
    );

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = toProviderError(
          await response.json().catch(() => ({})),
        );
        throw createUnauthorizedError(errorData.provider ?? "", provider);
      }
      throw new Error(`Failed to sync ${provider}`);
    }

    const data = (await response.json()) as SyncResponse;

    // SWR キャッシュを破棄して再フェッチを促す
    // mutate はキーを条件に破棄できる
    await mutate(
      (key) =>
        Array.isArray(key) &&
        (key[0] === "dashboard-provider-widgets" ||
          key[0] === "dashboard-stats"),
      undefined,
      { revalidate: true },
    );

    return data;
  };

  return { syncData };
};
