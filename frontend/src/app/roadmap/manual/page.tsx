"use client";

import Link from "next/link";
import { ManualRoadmapEditor } from "@/features/roadmap/components/ManualRoadmapEditor";
import { useManualRoadmapCreate } from "@/features/roadmap/hooks/useManualRoadmapCreate";

export default function ManualRoadmapCreatePage() {
  const {
    currentState,
    goalState,
    summary,
    milestones,
    isSaving,
    setCurrentState,
    setGoalState,
    setSummary,
    addMilestone,
    removeMilestone,
    updateMilestoneTitle,
    updateMilestoneDescription,
    addTask,
    removeTask,
    updateTaskTitle,
    updateTaskEstimatedHours,
    handleSave,
  } = useManualRoadmapCreate();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <Link
            href="/roadmap"
            className="cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            ← ロードマップ一覧に戻る
          </Link>
          <h1 className="mt-3 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
            手入力でロードマップ作成
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            現在地と目標を入力し、マイルストーンとタスクを自由に設計して保存します。
          </p>
        </div>

        <ManualRoadmapEditor
          currentState={currentState}
          goalState={goalState}
          summary={summary}
          milestones={milestones}
          isSaving={isSaving}
          onCurrentStateChange={setCurrentState}
          onGoalStateChange={setGoalState}
          onSummaryChange={setSummary}
          onMilestoneTitleChange={updateMilestoneTitle}
          onMilestoneDescriptionChange={updateMilestoneDescription}
          onAddMilestone={addMilestone}
          onRemoveMilestone={removeMilestone}
          onTaskTitleChange={updateTaskTitle}
          onTaskEstimatedHoursChange={updateTaskEstimatedHours}
          onAddTask={addTask}
          onRemoveTask={removeTask}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
