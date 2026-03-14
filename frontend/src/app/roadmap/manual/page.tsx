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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-200 via-white to-white px-4 py-12 transition-all duration-500 dark:from-slate-700 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/roadmap"
            className="cursor-pointer text-sm font-medium text-blue-600 transition-colors duration-300 hover:text-blue-700"
          >
            ← ロードマップ一覧に戻る
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
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
