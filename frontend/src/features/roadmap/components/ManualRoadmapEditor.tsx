"use client";

import type { ManualRoadmapMilestoneDraft } from "../hooks/useManualRoadmapCreate";

/**
 * 手入力ロードマップ編集コンポーネントのProps。
 */
export interface ManualRoadmapEditorProps {
  currentState: string;
  goalState: string;
  summary: string;
  milestones: ManualRoadmapMilestoneDraft[];
  isSaving: boolean;
  onCurrentStateChange: (value: string) => void;
  onGoalStateChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onMilestoneTitleChange: (milestoneIndex: number, value: string) => void;
  onMilestoneDescriptionChange: (milestoneIndex: number, value: string) => void;
  onAddMilestone: () => void;
  onRemoveMilestone: (milestoneIndex: number) => void;
  onTaskTitleChange: (
    milestoneIndex: number,
    taskIndex: number,
    value: string,
  ) => void;
  onTaskEstimatedHoursChange: (
    milestoneIndex: number,
    taskIndex: number,
    value: number | null,
  ) => void;
  onAddTask: (milestoneIndex: number) => void;
  onRemoveTask: (milestoneIndex: number, taskIndex: number) => void;
  onSave: () => void;
}

/**
 * 手入力ロードマップの入力UIを表示するコンポーネント。
 */
export const ManualRoadmapEditor = ({
  currentState,
  goalState,
  summary,
  milestones,
  isSaving,
  onCurrentStateChange,
  onGoalStateChange,
  onSummaryChange,
  onMilestoneTitleChange,
  onMilestoneDescriptionChange,
  onAddMilestone,
  onRemoveMilestone,
  onTaskTitleChange,
  onTaskEstimatedHoursChange,
  onAddTask,
  onRemoveTask,
  onSave,
}: ManualRoadmapEditorProps) => {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          基本情報
        </h2>
        <div className="grid gap-4">
          <div>
            <label
              htmlFor="manual-current-state"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              現在の状態 *
            </label>
            <input
              id="manual-current-state"
              value={currentState}
              onChange={(event) => onCurrentStateChange(event.target.value)}
              placeholder="例: バックエンド経験1年、TypeScriptは学習中"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="manual-goal-state"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              目標の状態 *
            </label>
            <input
              id="manual-goal-state"
              value={goalState}
              onChange={(event) => onGoalStateChange(event.target.value)}
              placeholder="例: フロントエンド領域を含むフルスタックエンジニア"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="manual-summary"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              サマリー（任意）
            </label>
            <textarea
              id="manual-summary"
              value={summary}
              onChange={(event) => onSummaryChange(event.target.value)}
              rows={3}
              placeholder="例: 業務で使う技術を中心に、3か月で土台を作る"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            マイルストーン
          </h2>
          <button
            type="button"
            onClick={onAddMilestone}
            className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            マイルストーンを追加
          </button>
        </div>

        <div className="space-y-5">
          {milestones.map((milestone, milestoneIndex) => (
            <article
              key={milestone.clientId}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/70"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  マイルストーン {milestoneIndex + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => onRemoveMilestone(milestoneIndex)}
                  className="cursor-pointer rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-900/20"
                  aria-label={`マイルストーン${milestoneIndex + 1}を削除`}
                >
                  削除
                </button>
              </div>

              <div className="grid gap-3">
                <input
                  value={milestone.title}
                  onChange={(event) =>
                    onMilestoneTitleChange(milestoneIndex, event.target.value)
                  }
                  placeholder="マイルストーン名 *"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <textarea
                  value={milestone.description}
                  onChange={(event) =>
                    onMilestoneDescriptionChange(
                      milestoneIndex,
                      event.target.value,
                    )
                  }
                  rows={2}
                  placeholder="目的・補足（任意）"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="mt-4 space-y-3">
                {milestone.tasks.map((task, taskIndex) => (
                  <div
                    key={task.clientId}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        タスク {taskIndex + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveTask(milestoneIndex, taskIndex)}
                        className="cursor-pointer text-xs font-medium text-red-500 hover:text-red-600"
                        aria-label={`タスク${taskIndex + 1}を削除`}
                      >
                        削除
                      </button>
                    </div>
                    <div className="grid gap-2 md:grid-cols-[1fr_160px]">
                      <input
                        value={task.title}
                        onChange={(event) =>
                          onTaskTitleChange(
                            milestoneIndex,
                            taskIndex,
                            event.target.value,
                          )
                        }
                        placeholder="タスク名 *"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={task.estimatedHours ?? ""}
                        onChange={(event) =>
                          onTaskEstimatedHoursChange(
                            milestoneIndex,
                            taskIndex,
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                        placeholder="時間(任意)"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onAddTask(milestoneIndex)}
                className="mt-3 cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
              >
                + タスクを追加
              </button>
            </article>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="w-full cursor-pointer rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "保存中..." : "この内容で保存する"}
      </button>
    </div>
  );
};
