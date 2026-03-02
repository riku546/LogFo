"use client";

import type { DeepPartial } from "ai";
import type { RoadmapGeneration } from "backend/src/schema/roadmapGeneration";

export interface RoadmapResultProps {
  // useObject から返される partial なオブジェクトを受け入れるように型を緩める
  generatedRoadmap: DeepPartial<RoadmapGeneration>;
  isGenerating: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

/**
 * 生成された（または生成途中の）ロードマップの結果を表示するPresentationalコンポーネント
 */
export const RoadmapResult = ({
  generatedRoadmap,
  isGenerating,
  isSaving,
  onSave,
  onReset,
}: RoadmapResultProps) => {
  return (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-blue-900 dark:bg-slate-900/80">
        <h2 className="mb-3 text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          📋 分析サマリー
          {!generatedRoadmap.summary && (
            <span className="flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </span>
          )}
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 min-h-6">
          {generatedRoadmap.summary || "分析中..."}
        </p>
      </div>

      {/* マイルストーン一覧 */}
      {(generatedRoadmap.milestones || []).map((milestone, milestoneIndex) => {
        if (!milestone) return null;
        return (
          <div
            key={`milestone-${milestone.title || "temp"}-${milestoneIndex}`}
            className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-blue-500 to-indigo-500 text-sm font-bold text-white">
                {milestoneIndex + 1}
              </span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {milestone.title || "生成中..."}
              </h3>
            </div>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {milestone.description || ""}
            </p>
            <ul className="space-y-2">
              {(milestone.tasks || []).map((task, taskIndex) => {
                if (!task) return null;
                return (
                  <li
                    key={`task-${milestone.title || "temp"}-${task.title || "temp"}-${taskIndex}`}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/50"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {task.title || "生成中..."}
                    </span>
                    {task.estimatedHours !== undefined &&
                      task.estimatedHours !== null && (
                        <span className="ml-2 shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          {task.estimatedHours}h
                        </span>
                      )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {/* アクションボタン */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 cursor-pointer rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          再生成する
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isGenerating}
          className="flex-1 cursor-pointer rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "保存中..." : "このロードマップを保存する"}
        </button>
      </div>
    </div>
  );
};
