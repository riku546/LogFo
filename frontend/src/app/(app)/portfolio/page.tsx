"use client";

import { useEffect, useState } from "react";
import { ConfigSidebar } from "@/features/portfolio/components/ConfigSidebar";
import { LivePreviewPane } from "@/features/portfolio/components/LivePreviewPane";
import { PublishSettingsPanel } from "@/features/portfolio/components/PublishSettingsPanel";
import { usePortfolioBuilder } from "@/features/portfolio/hooks/usePortfolioBuilder";
import type { RoadmapListItem } from "@/features/roadmap/api/roadmapApi";
import {
  fetchRoadmapDetail,
  fetchRoadmapList,
} from "@/features/roadmap/api/roadmapApi";
import type { SummaryItem } from "@/features/summary/api/summaryApi";
import { fetchSummariesByMilestone } from "@/features/summary/api/summaryApi";

/**
 * ポートフォリオビルダーページ
 * ConfigSidebar（左）+ LivePreviewPane（中央）の2カラム構成と、
 * 下部にPublishSettingsPanelを配置します。
 */
export default function PortfolioBuilderPage() {
  const {
    settings,
    slug,
    isPublic,
    isLoading,
    isSaving,
    setSlug,
    setIsPublic,
    updateProfile,
    updateSocialLinks,
    updateSections,
    handleSave,
  } = usePortfolioBuilder();

  const [availableRoadmaps, setAvailableRoadmaps] = useState<RoadmapListItem[]>(
    [],
  );
  const [availableSummaries, setAvailableSummaries] = useState<SummaryItem[]>(
    [],
  );

  /**
   * 選択可能なロードマップとサマリーを読み込む
   */
  useEffect(() => {
    const fetchAllSummaries = async (
      token: string,
      roadmaps: RoadmapListItem[],
    ) => {
      const allSummaries: SummaryItem[] = [];
      for (const roadmap of roadmaps) {
        const detail = await fetchRoadmapDetail(token, roadmap.id);
        for (const milestone of detail.milestones) {
          if (!milestone.id) continue;
          const summaries = await fetchSummariesByMilestone(
            token,
            milestone.id,
          );
          allSummaries.push(...summaries);
        }
      }
      return allSummaries;
    };

    const loadAvailableData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const roadmaps = await fetchRoadmapList(token);
        setAvailableRoadmaps(roadmaps);

        const summaries = await fetchAllSummaries(token, roadmaps);
        setAvailableSummaries(summaries);
      } catch (error) {
        console.error("Failed to load available data:", error);
      }
    };

    if (!isLoading) {
      loadAvailableData();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* メインコンテンツ: サイドバー + プレビュー */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <ConfigSidebar
          settings={settings}
          onUpdateProfile={updateProfile}
          onUpdateSocialLinks={updateSocialLinks}
          onUpdateSections={updateSections}
          availableSummaries={availableSummaries}
          availableRoadmaps={availableRoadmaps}
        />
        <LivePreviewPane settings={settings} />
      </div>

      {/* 下部: 公開設定パネル */}
      <PublishSettingsPanel
        slug={slug}
        isPublic={isPublic}
        isSaving={isSaving}
        onSlugChange={setSlug}
        onIsPublicChange={setIsPublic}
        onSave={handleSave}
      />
    </div>
  );
}
