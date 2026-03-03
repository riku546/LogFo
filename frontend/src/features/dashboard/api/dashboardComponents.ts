import useSWR, { useSWRConfig } from "swr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

/**
 * 汎用的な fetcher
 */
const fetcher = async ([url, token, _key]: [string, string, string]) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorInfo = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      errorInfo.message || "An error occurred while fetching the data.",
    );
  }
  return res.json();
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
 * ヒートマップ用データを取得する SWR Hook
 */
export const useGetDashboardHeatmapQuery = (
  startDate?: string,
  endDate?: string,
) => {
  const token = useToken();

  const qs = new URLSearchParams();
  if (startDate) qs.append("startDate", startDate);
  if (endDate) qs.append("endDate", endDate);

  const url = `${API_URL}/api/dashboard/heatmap${qs.toString() ? `?${qs.toString()}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR(
    token ? [url, token, "dashboard-heatmap"] : null,
    fetcher,
  );

  return {
    data: data as
      | { heatmapData: Array<{ date: string; totalCount: number }> }
      | undefined,
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

  const { data, error, isLoading, mutate } = useSWR(
    token ? [url, token, "dashboard-stats"] : null,
    fetcher,
  );

  return {
    data: data as
      | {
          stats: {
            totalActivities: number;
            providerDistribution: Record<string, number>;
          };
        }
      | undefined,
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
      throw new Error(`Failed to sync ${provider}`);
    }

    const data = (await response.json()) as {
      message: string;
      syncedItemsCount: number;
    };

    // SWR キャッシュを破棄して再フェッチを促す
    // mutate は キーを条件に破棄できる。配列の第3要素に "dashboard-heatmap" などを入れているためフィルタを使う
    await mutate(
      (key) =>
        Array.isArray(key) &&
        (key.includes("dashboard-heatmap") || key.includes("dashboard-stats")),
      undefined,
      { revalidate: true },
    );

    return data;
  };

  return { syncData };
};
