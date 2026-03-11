"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfigSidebar } from "@/features/portfolio/components/ConfigSidebar";
import { LivePreviewPane } from "@/features/portfolio/components/LivePreviewPane";
import { PublishSettingsModal } from "@/features/portfolio/components/PublishSettingsModal";
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
 * 下部にアクションバー、公開設定モーダルを配置します。
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
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const selectedRoadmaps = useMemo(() => {
    const roadmapById = new Map(
      availableRoadmaps.map((roadmap) => [roadmap.id, roadmap]),
    );

    return settings.sections.roadmapIds
      .map((roadmapId) => roadmapById.get(roadmapId))
      .filter((roadmap): roadmap is RoadmapListItem => roadmap !== undefined);
  }, [availableRoadmaps, settings.sections.roadmapIds]);

  const selectedSummaries = useMemo(() => {
    const summaryById = new Map(
      availableSummaries.map((summary) => [summary.id, summary]),
    );

    return settings.sections.summaryIds
      .map((summaryId) => summaryById.get(summaryId))
      .filter((summary): summary is SummaryItem => summary !== undefined);
  }, [availableSummaries, settings.sections.summaryIds]);

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
      <div className="relative flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="absolute top-10 left-10 h-44 w-44 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
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
    <div className="relative flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="absolute top-12 left-8 h-56 w-56 rounded-full bg-blue-400/15 blur-3xl" />
      <div className="absolute -bottom-10 right-10 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

      {/* メインコンテンツ: サイドバー + プレビュー */}
      <div className="relative flex flex-col lg:flex-row flex-1 min-h-0">
        <ConfigSidebar
          settings={settings}
          onUpdateProfile={updateProfile}
          onUpdateSocialLinks={updateSocialLinks}
          onUpdateSections={updateSections}
          availableSummaries={availableSummaries}
          availableRoadmaps={availableRoadmaps}
        />
        <LivePreviewPane
          settings={settings}
          summaries={selectedSummaries}
          roadmaps={selectedRoadmaps}
        />
      </div>

      {/* 下部: アクションバー */}
      <PublishSettingsPanel
        isSaving={isSaving}
        onSave={handleSave}
        onOpenPublishSettings={() => setIsPublishModalOpen(true)}
      />

      {/* 公開設定モーダル */}
      <PublishSettingsModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        slug={slug}
        isPublic={isPublic}
        onSlugChange={setSlug}
        onIsPublicChange={setIsPublic}
      />
    </div>
  );
}
