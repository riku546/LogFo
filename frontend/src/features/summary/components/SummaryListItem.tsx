"use client";

import type { SummaryItem } from "../api/summaryApi";

export interface SummaryListItemProps {
  summary: SummaryItem;
  onDelete: (summaryId: string) => void;
}

/**
 * サマリー一覧のカードアイテム
 * タイトル、作成日、内容プレビューを表示します。
 */
export const SummaryListItem = ({
  summary,
  onDelete,
}: SummaryListItemProps) => {
  return (
    <div className="glass rounded-2xl p-5 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
            {summary.title || "無題のサマリー"}
          </h3>
          <div className="mt-1 flex items-center text-xs text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1.5"
            >
              <title>作成日</title>
              <rect width="18" height="18" x="3" y="4" r="2" />
              <path d="M3 10h18" />
              <path d="M8 2v4" />
              <path d="M16 2v4" />
            </svg>
            {new Date(summary.createdAt).toLocaleDateString("ja-JP")}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(summary.id)}
          className="ml-3 cursor-pointer shrink-0 rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
          aria-label="サマリーを削除"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>削除</title>
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* コンテンツプレビュー */}
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {summary.content}
      </p>
    </div>
  );
};
