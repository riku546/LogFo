"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ActivityDrawer } from "@/features/activity/components/ActivityDrawer";
import { MilestoneCard } from "@/features/roadmap/components/MilestoneCard";
import { ProgressBar } from "@/features/roadmap/components/ProgressBar";
import { useRoadmapDetail } from "@/features/roadmap/hooks/useRoadmapDetail";

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId =
    typeof params.id === "string" ? params.id : (params.id?.[0] ?? "");

  const {
    roadmap,
    isLoading,
    isSaving,
    isEditing,
    currentMilestones,
    progress,
    startEditing,
    cancelEditing,
    changeTaskStatus,
    addTask,
    changeTaskTitle,
    removeTask,
    handleSave,
    handleDelete,
  } = useRoadmapDetail(roadmapId);

  // ActivityDrawerの状態管理
  const [selectedTask, setSelectedTask] = useState<{
    id?: string;
    title: string;
    status: string;
  } | null>(null);

  const handleTaskClick = useCallback(
    (task: { id?: string; title: string; status: string }) => {
      if (!isEditing) {
        setSelectedTask(task);
      }
    },
    [isEditing],
  );

  const handleCloseDrawer = useCallback(() => {
    setSelectedTask(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="glass flex items-center gap-3 rounded-2xl px-6 py-4 text-slate-500">
          <svg
            className="h-6 w-6 animate-spin"
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
          読み込み中...
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="glass rounded-2xl px-6 py-4 text-slate-500">
          ロードマップが見つかりません
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/roadmap")}
              className="mb-2 cursor-pointer text-sm text-blue-600 transition-colors duration-300 hover:text-blue-700"
            >
              ← ロードマップ一覧
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {roadmap.goalState}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {roadmap.currentState}
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? "保存中..." : "保存する"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startEditing}
                  className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-700"
                >
                  編集する
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="cursor-pointer rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  削除
                </button>
              </>
            )}
          </div>
        </div>

        {/* 進捗バー */}
        <ProgressBar progress={progress} />

        {/* サマリー */}
        {roadmap.summary && (
          <div className="glass mb-6 rounded-2xl p-6">
            <h2 className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">
              📋 分析サマリー
            </h2>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {roadmap.summary}
            </p>
          </div>
        )}

        {/* マイルストーン一覧 */}
        <div className="space-y-6">
          {currentMilestones.map((milestone, milestoneIndex) => (
            <MilestoneCard
              key={milestone.id || `milestone-${milestoneIndex}`}
              milestone={milestone}
              milestoneIndex={milestoneIndex}
              isEditing={isEditing}
              onChangeTaskStatus={changeTaskStatus}
              onChangeTaskTitle={changeTaskTitle}
              onRemoveTask={removeTask}
              onAddTask={addTask}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        {/* 活動記録ドロワー */}
        <ActivityDrawer
          isOpen={selectedTask !== null}
          taskId={selectedTask?.id ?? null}
          taskTitle={selectedTask?.title ?? ""}
          onClose={handleCloseDrawer}
        />
      </div>
    </div>
  );
}
