"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  generatePortfolioContent,
  PortfolioApiError,
  type PortfolioGeneratedSectionKey,
} from "@/features/portfolio/api/portfolioApi";
import { ConfigSidebar } from "@/features/portfolio/components/ConfigSidebar";
import { LivePreviewPane } from "@/features/portfolio/components/LivePreviewPane";
import { PublishSettingsModal } from "@/features/portfolio/components/PublishSettingsModal";
import { PublishSettingsPanel } from "@/features/portfolio/components/PublishSettingsPanel";
import { usePortfolioBuilder } from "@/features/portfolio/hooks/usePortfolioBuilder";
import type { SummaryItem } from "@/features/summary/api/summaryApi";
import { fetchMySummaries } from "@/features/summary/api/summaryApi";

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
    updateGeneration,
    updateGeneratedContent,
    handleSave,
  } = usePortfolioBuilder();

  const [availableSummaries, setAvailableSummaries] = useState<SummaryItem[]>(
    [],
  );
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatingTargetSection, setGeneratingTargetSection] = useState<
    PortfolioGeneratedSectionKey | "all" | null
  >(null);

  /**
   * サマリー選択UI向けデータを読み込む
   */
  useEffect(() => {
    const loadAvailableSummaries = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const summaries = await fetchMySummaries(token);
        setAvailableSummaries(summaries);
      } catch (error) {
        console.error("Failed to load summaries:", error);
      }
    };

    if (!isLoading) {
      loadAvailableSummaries();
    }
  }, [isLoading]);

  /**
   * 生成時エラーをトーストへ変換する
   */
  const handleGenerateError = useCallback((error: unknown) => {
    if (error instanceof PortfolioApiError && error.statusCode === 400) {
      toast.error(
        "サマリーを1件以上選択するか、自己PR下書きを入力してください",
      );
      return;
    }

    if (error instanceof PortfolioApiError && error.statusCode === 403) {
      toast.error("選択したサマリーにアクセスできません");
      return;
    }

    toast.error("ポートフォリオ文章の生成に失敗しました");
  }, []);

  /**
   * ローカルストレージからトークンを取得する
   *
   * @returns JWTトークン。未ログイン時はnull
   */
  const getAuthToken = useCallback((): string | null => {
    const token = localStorage.getItem("token");
    if (token) {
      return token;
    }

    toast.error("ログインが必要です");
    return null;
  }, []);

  /**
   * AI文章生成を実行する
   */
  const handleGenerateContent = useCallback(
    async (targetSection?: PortfolioGeneratedSectionKey) => {
      const token = getAuthToken();
      if (!token) return;

      setIsGeneratingContent(true);
      setGeneratingTargetSection(targetSection ?? "all");

      try {
        const generatedContent = await generatePortfolioContent(token, {
          selectedSummaryIds: settings.generation.selectedSummaryIds,
          selfPrDraft: settings.generation.selfPrDraft,
          profile: settings.profile,
          currentContent: settings.generatedContent,
          targetSection,
        });

        updateGeneratedContent(generatedContent);
        toast.success(
          targetSection
            ? "指定した項目を再生成しました"
            : "ポートフォリオ文章を生成しました",
        );
      } catch (error) {
        handleGenerateError(error);
      } finally {
        setIsGeneratingContent(false);
        setGeneratingTargetSection(null);
      }
    },
    [
      settings.generation.selectedSummaryIds,
      settings.generation.selfPrDraft,
      settings.generatedContent,
      settings.profile,
      getAuthToken,
      handleGenerateError,
      updateGeneratedContent,
    ],
  );

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

      <div className="relative flex flex-col lg:flex-row flex-1 min-h-0">
        <ConfigSidebar
          settings={settings}
          onUpdateProfile={updateProfile}
          onUpdateSocialLinks={updateSocialLinks}
          onUpdateGeneration={updateGeneration}
          onUpdateGeneratedContent={updateGeneratedContent}
          availableSummaries={availableSummaries}
          isGeneratingContent={isGeneratingContent}
          generatingTargetSection={generatingTargetSection}
          onGenerateContent={handleGenerateContent}
        />
        <LivePreviewPane settings={settings} />
      </div>

      <PublishSettingsPanel
        isSaving={isSaving}
        onSave={handleSave}
        onOpenPublishSettings={() => setIsPublishModalOpen(true)}
      />

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
