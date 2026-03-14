"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  generatePortfolioContentStream,
  PortfolioApiError,
  type PortfolioGeneratedSectionKey,
} from "@/features/portfolio/api/portfolioApi";
import {
  ConfigSidebar,
  type PortfolioChatMessage,
} from "@/features/portfolio/components/ConfigSidebar";
import { LivePreviewPane } from "@/features/portfolio/components/LivePreviewPane";
import { PublishSettingsModal } from "@/features/portfolio/components/PublishSettingsModal";
import { PublishSettingsPanel } from "@/features/portfolio/components/PublishSettingsPanel";
import { SummarySelectionModal } from "@/features/portfolio/components/SummarySelectionModal";
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
  const [isSummarySelectionModalOpen, setIsSummarySelectionModalOpen] =
    useState(false);
  const [draftSelectedSummaryIds, setDraftSelectedSummaryIds] = useState<
    string[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<PortfolioChatMessage[]>([]);

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
      toast.error("自由入力テキストを入力してください");
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

  const createMessageId = useCallback((prefix: "user" | "assistant") => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return `${prefix}-${Date.now()}`;
  }, []);

  const appendRequestMessages = useCallback(
    (
      userMessageId: string,
      assistantMessageId: string,
      chatInput: string,
      targetSection: PortfolioGeneratedSectionKey,
    ) => {
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          role: "user",
          content: chatInput,
          targetSection,
          status: "done",
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          targetSection,
          status: "streaming",
        },
      ]);
    },
    [],
  );

  const appendAssistantChunk = useCallback(
    (assistantMessageId: string, chunk: string) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: `${message.content}${chunk}`,
              }
            : message,
        ),
      );
    },
    [],
  );

  const completeAssistantMessage = useCallback(
    (assistantMessageId: string, content: string) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content,
                status: "done",
              }
            : message,
        ),
      );
    },
    [],
  );

  const failAssistantMessage = useCallback(
    (assistantMessageId: string, fallbackMessage: string) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                status: "error",
                content: message.content || fallbackMessage,
              }
            : message,
        ),
      );
    },
    [],
  );

  const handleOpenSummarySelectionModal = useCallback(() => {
    setDraftSelectedSummaryIds(settings.generation.selectedSummaryIds ?? []);
    setIsSummarySelectionModalOpen(true);
  }, [settings.generation.selectedSummaryIds]);

  const handleToggleDraftSummary = useCallback((summaryId: string) => {
    setDraftSelectedSummaryIds((previousIds) => {
      if (previousIds.includes(summaryId)) {
        return previousIds.filter((id) => id !== summaryId);
      }

      if (previousIds.length >= 5) {
        return previousIds;
      }

      return [...previousIds, summaryId];
    });
  }, []);

  const handleApplySummarySelection = useCallback(() => {
    updateGeneration({ selectedSummaryIds: draftSelectedSummaryIds });
    setIsSummarySelectionModalOpen(false);
  }, [draftSelectedSummaryIds, updateGeneration]);

  const handleCloseSummarySelectionModal = useCallback(() => {
    setIsSummarySelectionModalOpen(false);
  }, []);

  /**
   * AI文章生成を実行する
   */
  const handleSendMessage = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    const chatInput = settings.generation.chatInput;
    const targetSection =
      settings.generation.targetSection ??
      ("selfPr" as PortfolioGeneratedSectionKey);

    if (!chatInput.trim()) {
      toast.error("自由入力テキストを入力してください");
      return;
    }

    const userMessageId = createMessageId("user");
    const assistantMessageId = createMessageId("assistant");

    appendRequestMessages(
      userMessageId,
      assistantMessageId,
      chatInput,
      targetSection,
    );

    updateGeneration({ chatInput: "" });

    setIsStreaming(true);
    let completedText = "";

    try {
      await generatePortfolioContentStream(
        token,
        {
          chatInput,
          targetSection,
          selectedSummaryIds: settings.generation.selectedSummaryIds,
          profile: settings.profile,
          currentContent: settings.generatedContent,
        },
        {
          onDelta: (chunk) => {
            completedText += chunk;
            appendAssistantChunk(assistantMessageId, chunk);
          },
          onComplete: (text) => {
            const resolvedText = text || completedText;
            completeAssistantMessage(assistantMessageId, resolvedText);
          },
          onError: (message) => {
            failAssistantMessage(assistantMessageId, message);
          },
        },
      );

      toast.success("ポートフォリオ文章の候補を生成しました");
    } catch (error) {
      handleGenerateError(error);
      failAssistantMessage(
        assistantMessageId,
        "ポートフォリオ文章の生成に失敗しました",
      );
    } finally {
      setIsStreaming(false);
    }
  }, [
    settings.generation.chatInput,
    settings.generation.targetSection,
    settings.generation.selectedSummaryIds,
    settings.generatedContent,
    settings.profile,
    appendAssistantChunk,
    appendRequestMessages,
    completeAssistantMessage,
    createMessageId,
    failAssistantMessage,
    getAuthToken,
    handleGenerateError,
    updateGeneration,
  ]);

  /**
   * メッセージの本文を選択項目へ反映する
   */
  const handleApplyMessage = useCallback(
    (messageId: string) => {
      const targetMessage = messages.find(
        (message) => message.id === messageId,
      );
      if (!targetMessage || targetMessage.role !== "assistant") {
        return;
      }

      if (!targetMessage.content.trim()) {
        toast.error("適用できる生成本文がありません");
        return;
      }

      updateGeneratedContent({
        [targetMessage.targetSection]: targetMessage.content,
      });
      const sectionLabelMap: Record<PortfolioGeneratedSectionKey, string> = {
        selfPr: "自己PR",
        strengths: "強み",
        learnings: "学び",
        futureVision: "将来",
      };
      toast.success(
        `${sectionLabelMap[targetMessage.targetSection]} に生成本文を反映しました`,
      );
    },
    [messages, updateGeneratedContent],
  );

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <div className="absolute top-10 left-10 h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-blue-300/10 blur-3xl" />
        <div className="glass space-y-3 rounded-2xl px-8 py-7 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-background">
      <div className="absolute top-12 left-8 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute -bottom-10 right-10 h-64 w-64 rounded-full bg-blue-300/10 blur-3xl" />

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <ConfigSidebar
          settings={settings}
          onUpdateGeneration={updateGeneration}
          isStreaming={isStreaming}
          messages={messages}
          onSendMessage={handleSendMessage}
          onApplyMessage={handleApplyMessage}
          onOpenSummarySelection={handleOpenSummarySelectionModal}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          <LivePreviewPane
            settings={settings}
            isEditing={isEditing}
            onToggleEditing={() => setIsEditing((prev) => !prev)}
            onUpdateProfile={updateProfile}
            onUpdateSocialLinks={updateSocialLinks}
            onUpdateGeneratedContent={updateGeneratedContent}
          />

          <PublishSettingsPanel
            isSaving={isSaving}
            onSave={handleSave}
            onOpenPublishSettings={() => setIsPublishModalOpen(true)}
          />
        </div>
      </div>

      <PublishSettingsModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        slug={slug}
        isPublic={isPublic}
        onSlugChange={setSlug}
        onIsPublicChange={setIsPublic}
      />

      <SummarySelectionModal
        isOpen={isSummarySelectionModalOpen}
        summaries={availableSummaries}
        selectedSummaryIds={draftSelectedSummaryIds}
        onToggleSummary={handleToggleDraftSummary}
        onApply={handleApplySummarySelection}
        onClose={handleCloseSummarySelectionModal}
      />
    </div>
  );
}
