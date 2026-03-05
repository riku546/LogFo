"use client";

import type { SummaryFormat } from "../api/summaryApi";

/**
 * フォーマットの表示名マッピング
 */
const FORMAT_OPTIONS: {
  value: SummaryFormat;
  label: string;
  description: string;
}[] = [
  {
    value: "self_pr",
    label: "自己PR風",
    description: "就活・転職向けの実績ベースの文体",
  },
  {
    value: "monthly_report",
    label: "月報・レポート風",
    description: "箇条書きを活用した振り返りレポート",
  },
  {
    value: "casual_review",
    label: "カジュアル振り返り",
    description: "ブログ記事のような親しみやすい文体",
  },
];

export interface SummaryConfigPanelProps {
  milestones: Array<{ id: string; title: string }>;
  selectedMilestoneId: string;
  onMilestoneChange: (milestoneId: string) => void;
  selectedFormat: SummaryFormat;
  onFormatChange: (format: SummaryFormat) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

/**
 * サマリー生成の設定パネル
 * マイルストーン選択 + 出力フォーマット選択 + 生成ボタン
 */
export const SummaryConfigPanel = ({
  milestones,
  selectedMilestoneId,
  onMilestoneChange,
  selectedFormat,
  onFormatChange,
  onGenerate,
  isGenerating,
}: SummaryConfigPanelProps) => {
  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        サマリー生成設定
      </h2>

      {/* マイルストーン選択 */}
      <div className="space-y-2">
        <label
          htmlFor="milestone-select"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          対象マイルストーン
        </label>
        <select
          id="milestone-select"
          value={selectedMilestoneId}
          onChange={(e) => onMilestoneChange(e.target.value)}
          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          disabled={isGenerating}
        >
          <option value="">マイルストーンを選択...</option>
          {milestones.map((milestone) => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.title}
            </option>
          ))}
        </select>
      </div>

      {/* フォーマット選択 */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          出力フォーマット
        </span>
        <div className="grid gap-3">
          {FORMAT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center rounded-xl border-2 px-4 py-3 transition-all ${
                selectedFormat === option.value
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              }`}
            >
              <input
                type="radio"
                name="summary-format"
                value={option.value}
                checked={selectedFormat === option.value}
                onChange={() => onFormatChange(option.value)}
                className="sr-only"
                disabled={isGenerating}
              />
              <div className="flex-1">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {option.label}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {option.description}
                </span>
              </div>
              <div
                className={`h-4 w-4 rounded-full border-2 transition-all ${
                  selectedFormat === option.value
                    ? "border-primary bg-primary"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              >
                {selectedFormat === option.value && (
                  <div className="h-full w-full rounded-full bg-white scale-[0.4]" />
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 生成ボタン */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || !selectedMilestoneId}
        className="w-full cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <title>生成中</title>
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
            生成中...
          </span>
        ) : (
          "サマリーを生成する"
        )}
      </button>
    </div>
  );
};
