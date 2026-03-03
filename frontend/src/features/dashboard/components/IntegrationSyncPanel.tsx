"use client";

import { CheckCircle2, Code2, Github, RefreshCw } from "lucide-react";
import { useState } from "react";

export const IntegrationSyncPanel = () => {
  const [syncingProviders, setSyncingProviders] = useState<
    Record<string, boolean>
  >({});
  // const [syncedProviders, setSyncedProviders] = useState<Record<string, boolean>>({});

  const handleAuthRedirect = (provider: string) => {
    setSyncingProviders((prev) => ({ ...prev, [provider]: true }));
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
    // バックエンドのOAuthエンドポイントへ遷移
    window.location.href = `${API_URL}/api/auth/${provider}`;
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
    {
      id: "zenn",
      name: "Zenn",
      icon: (
        <span className="w-5 h-5 flex items-center justify-center font-bold text-blue-500">
          Z
        </span>
      ),
    },
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
          // 本来はDBから連携済みかどうかを取得するが、今はハードコード（未連携と想定）
          const isSynced = false;

          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5"
            >
              <div className="flex items-center space-x-3">
                {p.icon}
                <span className="font-medium">{p.name}</span>
              </div>
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
                ) : isSynced ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>連携済み</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>連携する</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
