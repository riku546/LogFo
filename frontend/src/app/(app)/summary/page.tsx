"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  RoadmapListItem,
  RoadmapMilestone,
} from "@/features/roadmap/api/roadmapApi";
import {
  fetchRoadmapDetail,
  fetchRoadmapList,
} from "@/features/roadmap/api/roadmapApi";
import { SummaryChatStream } from "@/features/summary/components/SummaryChatStream";
import { SummaryConfigPanel } from "@/features/summary/components/SummaryConfigPanel";
import { SummaryEditor } from "@/features/summary/components/SummaryEditor";
import { SummaryListItem } from "@/features/summary/components/SummaryListItem";
import { useSummaryGenerate } from "@/features/summary/hooks/useSummaryGenerate";
import { useSummaryList } from "@/features/summary/hooks/useSummaryList";

/**
 * サマリー機能のメインページ
 * マイルストーン選択 → AI生成 → 編集保存 のフローを提供します。
 */
export default function SummaryPage() {
  const router = useRouter();

  // ロードマップ・マイルストーンデータ
  const [roadmapList, setRoadmapList] = useState<RoadmapListItem[]>([]);
  const [milestones, setMilestones] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState("");

  // サマリー生成フック
  const {
    selectedMilestoneId,
    setSelectedMilestoneId,
    selectedFormat,
    setSelectedFormat,
    streamedText,
    isGenerating,
    isGenerated,
    summaryTitle,
    setSummaryTitle,
    editedContent,
    setEditedContent,
    isSaving,
    handleGenerate,
    handleSave: handleSaveOriginal,
    handleReset,
  } = useSummaryGenerate();

  // サマリー一覧フック
  const {
    summaryList,
    isLoading: isLoadingSummaries,
    handleDelete,
    refetch,
  } = useSummaryList(selectedMilestoneId);

  // ロードマップ一覧の取得
  useEffect(() => {
    const loadRoadmaps = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("ログインが必要です");
        router.push("/signin");
        return;
      }

      try {
        const roadmaps = await fetchRoadmapList(token);
        setRoadmapList(roadmaps);
      } catch (error) {
        console.error(error);
        toast.error("ロードマップの取得に失敗しました");
      } finally {
        setIsLoadingRoadmaps(false);
      }
    };

    loadRoadmaps();
  }, [router]);

  // ロードマップ選択時にマイルストーンを取得
  useEffect(() => {
    if (!selectedRoadmapId) {
      setMilestones([]);
      setSelectedMilestoneId("");
      return;
    }

    const loadMilestones = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const detail = await fetchRoadmapDetail(token, selectedRoadmapId);
        const milestoneOptions = detail.milestones.map(
          (m: RoadmapMilestone) => ({
            id: m.id ?? "",
            title: m.title,
          }),
        );
        setMilestones(milestoneOptions);
      } catch (error) {
        console.error(error);
        toast.error("マイルストーンの取得に失敗しました");
      }
    };

    loadMilestones();
  }, [selectedRoadmapId, setSelectedMilestoneId]);

  // 保存後にリストを更新
  const handleSave = async () => {
    await handleSaveOriginal();
    refetch();
  };

  if (isLoadingRoadmaps) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-200 via-white to-white transition-all duration-500 dark:from-slate-700 dark:via-slate-900 dark:to-slate-950">
        <div className="flex items-center gap-3 text-slate-500 glass px-6 py-4 rounded-2xl shadow-lg">
          <svg
            className="h-6 w-6 animate-spin text-primary"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <title>読み込み中</title>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="font-medium dark:text-slate-300">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-200 via-white to-white py-12 transition-all duration-500 dark:from-slate-700 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="mx-auto max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            活動サマリー
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            学習の軌跡をAIが要約し、自己PRや振り返りに活用できます
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* 左カラム: 設定パネル */}
          <div className="space-y-6">
            {/* ロードマップ選択 */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <label
                htmlFor="roadmap-select"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                対象ロードマップ
              </label>
              <select
                id="roadmap-select"
                value={selectedRoadmapId}
                onChange={(e) => setSelectedRoadmapId(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                disabled={isGenerating}
              >
                <option value="">ロードマップを選択...</option>
                {roadmapList.map((roadmap) => (
                  <option key={roadmap.id} value={roadmap.id}>
                    {roadmap.goalState}
                  </option>
                ))}
              </select>
            </div>

            {/* マイルストーン＋フォーマット選択 */}
            {selectedRoadmapId && (
              <SummaryConfigPanel
                milestones={milestones}
                selectedMilestoneId={selectedMilestoneId}
                onMilestoneChange={setSelectedMilestoneId}
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
          </div>

          {/* 右カラム: 生成結果・編集・一覧 */}
          <div className="space-y-6">
            {/* ストリーミングプレビュー */}
            <SummaryChatStream
              streamedText={streamedText}
              isGenerating={isGenerating}
            />

            {/* 編集エリア（生成完了後に表示） */}
            {isGenerated && (
              <SummaryEditor
                title={summaryTitle}
                onTitleChange={setSummaryTitle}
                content={editedContent}
                onContentChange={setEditedContent}
                onSave={handleSave}
                onReset={handleReset}
                isSaving={isSaving}
              />
            )}

            {/* 既存サマリー一覧 */}
            {selectedMilestoneId && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  保存済みサマリー
                </h2>
                {isLoadingSummaries ? (
                  <div className="glass rounded-2xl p-8 text-center text-slate-400">
                    読み込み中...
                  </div>
                ) : summaryList.length === 0 ? (
                  <div className="glass rounded-2xl border-dashed p-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                      保存済みのサマリーはまだありません
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {summaryList.map((summary) => (
                      <SummaryListItem
                        key={summary.id}
                        summary={summary}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
