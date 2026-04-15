"use client";

import { useEffect } from "react";
import type { SummaryItem } from "@/types/summary";

export interface SummarySelectionModalProps {
  isOpen: boolean;
  summaries: SummaryItem[];
  selectedSummaryIds: string[];
  onToggleSummary: (summaryId: string) => void;
  onApply: () => void;
  onClose: () => void;
}

/**
 * 生成に使うサマリーを選択するモーダル
 */
export const SummarySelectionModal = ({
  isOpen,
  summaries,
  selectedSummaryIds,
  onToggleSummary,
  onApply,
  onClose,
}: SummarySelectionModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="サマリー選択モーダルを閉じる"
      />

      <div className="relative mx-4 w-full max-w-2xl rounded-2xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/90">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-(--font-poppins) text-lg font-semibold text-slate-900 dark:text-white">
              生成に使うサマリーを選択
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              最大5件まで選択できます
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-all duration-300 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            aria-label="閉じる"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>閉じる</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {summaries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300/80 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              利用可能なサマリーがありません
            </p>
          ) : (
            summaries.map((summary) => {
              const isSelected = selectedSummaryIds.includes(summary.id);
              const canSelectMore = isSelected || selectedSummaryIds.length < 5;

              return (
                <label
                  key={summary.id}
                  htmlFor={`summary-modal-${summary.id}`}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${
                    canSelectMore
                      ? "border-slate-200 bg-white/70 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-700/40 dark:hover:bg-slate-700/60"
                      : "cursor-not-allowed border-slate-200 bg-slate-100/70 opacity-60 dark:border-white/10 dark:bg-slate-700/30"
                  }`}
                >
                  <input
                    id={`summary-modal-${summary.id}`}
                    type="checkbox"
                    checked={isSelected}
                    disabled={!canSelectMore}
                    onChange={() => onToggleSummary(summary.id)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 dark:border-slate-600"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                      {summary.title || "無題のサマリー"}
                    </p>
                    <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {summary.content}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedSummaryIds.length}/5件 選択中
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onApply}
              className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-700"
            >
              適用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
