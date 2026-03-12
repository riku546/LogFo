import useSWR, { useSWRConfig } from "swr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
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

/**
 * 汎用的な fetcher
 */
const fetcher = async <T>([url, token, _key]: [string, string, string]) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorInfo = toDashboardError(await res.json().catch(() => ({})));
    throw new Error(
      errorInfo.message || "An error occurred while fetching the data.",
    );
  }
  const data: T = await res.json();
  return data;
};

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
  const url = `${API_URL}/api/dashboard/provider-widgets`;

  const { data, error, isLoading, mutate } = useSWR<ProviderWidgetsResponse>(
    token ? [url, token, "dashboard-provider-widgets"] : null,
    fetcher,
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
  const url = `${API_URL}/api/dashboard/stats`;

  const { data, error, isLoading, mutate } = useSWR<DashboardStatsResponse>(
    token ? [url, token, "dashboard-stats"] : null,
    fetcher,
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
  const url = `${API_URL}/api/auth/status`;

  const { data, error, isLoading, mutate } = useSWR<IntegrationStatusResponse>(
    token ? [url, token, "integration-status"] : null,
    fetcher,
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

/**
 * 手動同期を実行するフック（SWR の mutate を使用して関連キャッシュを破棄）
 */
export const useSyncExternalData = () => {
  const token = useToken();
  const { mutate } = useSWRConfig();

  const syncData = async (provider: string) => {
    if (!token) throw new Error("Unauthorized");

    const response = await fetch(`${API_URL}/api/dashboard/sync/${provider}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = toProviderError(
          await response.json().catch(() => ({})),
        );
        throw createUnauthorizedError(errorData.provider ?? "", provider);
      }
      throw new Error(`Failed to sync ${provider}`);
    }

    const data: SyncResponse = await response.json();

    // SWR キャッシュを破棄して再フェッチを促す
    // mutate は キーを条件に破棄できる。配列の第3要素に "dashboard-provider-widgets" などを入れる
    await mutate(
      (key) =>
        Array.isArray(key) &&
        (key.includes("dashboard-provider-widgets") ||
          key.includes("dashboard-stats")),
      undefined,
      { revalidate: true },
    );

    return data;
  };

  return { syncData };
};
