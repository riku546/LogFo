"use client";

import { CheckCircle2, Code2, Github, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import {
  useGetIntegrationStatusQuery,
  useSyncExternalData,
} from "../api/dashboardComponents";

export const IntegrationSyncPanel = () => {
  const { data: statusData } = useGetIntegrationStatusQuery();
  const { syncData } = useSyncExternalData();
  const [syncingProviders, setSyncingProviders] = useState<
    Record<string, boolean>
  >({});

  const handleAuthRedirect = async (provider: string) => {
    setSyncingProviders((prev) => ({ ...prev, [provider]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
      const res = await fetch(`${API_URL}/api/auth/${provider}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData: { message?: string } = await res.json();
        throw new Error(
          errorData?.message || "Failed to get authorization url",
        );
      }

      const data: { redirectUrl?: string } = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (e) {
      console.error(e);
      setSyncingProviders((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const handleSyncNow = async (provider: string) => {
    setSyncingProviders((prev) => ({ ...prev, [provider]: true }));
    let isUnauthorized = false;
    try {
      await syncData(provider);
      // 成功トーストなどを出せればベター
      alert(`${provider}の同期が完了しました`);
    } catch (e: unknown) {
      console.error(e);
      if (isStatusError(e) && e.status === 401) {
        isUnauthorized = true;
        // 401の場合は自動で再連携リダイレクトを実行
        console.log(
          `401 Unauthorized detected for ${provider}. Redirecting to auth...`,
        );
        handleAuthRedirect(provider);
        return;
      }
      alert(`${provider}の同期に失敗しました`);
    } finally {
      if (!isUnauthorized) {
        setSyncingProviders((prev) => ({ ...prev, [provider]: false }));
      }
    }
  };

  const providers = [
    {
      id: "github",
      name: "GitHub",
      icon: <Github className="w-5 h-5 text-[#2563eb]" />,
    },
    {
      id: "wakatime",
      name: "WakaTime",
      icon: <Code2 className="w-5 h-5 text-purple-500" />,
    },
    // {
    //   id: "zenn",
    //   name: "Zenn",
    //   icon: (
    //     <span className="w-5 h-5 flex items-center justify-center font-bold text-blue-500">
    //       Z
    //     </span>
    //   ),
    // },
  ];

  return (
    <div className="glass p-6 rounded-2xl w-full">
      <div className="flex flex-col mb-4">
        <h3 className="text-xl font-semibold mb-2">外部サービス連携</h3>
        <p className="text-sm opacity-80">
          GitHubやWakaTimeなどから活動データを同期し、ダッシュボードに反映させます。（※現在モック動作）
        </p>
      </div>

      <div className="flex flex-col space-y-3">
        {providers.map((p) => {
          const isSyncing = syncingProviders[p.id];
          const isSynced = statusData?.integrations.some(
            (i) => i.provider === p.id && i.connected,
          );

          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5"
            >
              <div className="flex items-center space-x-3">
                {p.icon}
                <div className="flex flex-col">
                  <span className="font-medium">{p.name}</span>
                  {isSynced && (
                    <span className="text-[10px] text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 連携済み
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {isSynced ? (
                  <button
                    type="button"
                    onClick={() => handleSyncNow(p.id)}
                    disabled={isSyncing}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>今すぐ同期</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAuthRedirect(p.id)}
                    disabled={isSyncing}
                    className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>遷移中...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>連携する</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const isStatusError = (value: unknown): value is { status?: number } => {
  return typeof value === "object" && value !== null && "status" in value;
};
