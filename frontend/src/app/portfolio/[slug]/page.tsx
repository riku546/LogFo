"use client";

import { useParams } from "next/navigation";
import { PortfolioPublicView } from "@/features/portfolio/components/PortfolioPublicView";
import { usePublicPortfolio } from "@/features/portfolio/hooks/usePublicPortfolio";

/**
 * 公開ポートフォリオページ
 * Slugに基づいて公開ポートフォリオを表示します（認証不要）。
 */
export default function PublicPortfolioPage() {
  const params = useParams();
  const slug =
    typeof params.slug === "string" ? params.slug : (params.slug?.[0] ?? "");
  const { portfolioData, isLoading, error } = usePublicPortfolio(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="text-center space-y-4">
          <div className="text-6xl">📂</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            ポートフォリオが見つかりません
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {error || "このURLのポートフォリオは存在しないか、非公開です。"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900">
      <PortfolioPublicView settings={portfolioData.settings} />
    </main>
  );
}
