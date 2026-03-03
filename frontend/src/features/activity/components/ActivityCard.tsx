"use client";

import { useState } from "react";
import Markdown from "react-markdown";
import type { ActivityLogItem } from "../api/activityApi";

export interface ActivityCardProps {
  activityLog: ActivityLogItem;
  onUpdate: (activityId: string, content: string) => void;
  onDelete: (activityId: string) => void;
}

/**
 * タイムライン内の個別活動記録カード
 * 日付、Markdownプレビュー、編集・削除操作を提供
 */
export const ActivityCard = ({
  activityLog,
  onUpdate,
  onDelete,
}: ActivityCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(activityLog.content);

  const handleSave = () => {
    onUpdate(activityLog.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(activityLog.content);
    setIsEditing(false);
  };

  const formattedDate = new Date(activityLog.loggedDate).toLocaleDateString(
    "ja-JP",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80">
      {/* ヘッダー */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {formattedDate}
          </span>
        </div>
        {!isEditing && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => onDelete(activityLog.id)}
              className="cursor-pointer rounded-lg px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              削除
            </button>
          </div>
        )}
      </div>

      {/* 本文 */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            className="min-h-[120px] resize-y rounded-lg border border-slate-200 bg-white p-3 font-mono text-sm text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="cursor-pointer rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-slate-800 prose-p:text-slate-600 dark:prose-headings:text-slate-100 dark:prose-p:text-slate-300">
          <Markdown>{activityLog.content}</Markdown>
        </div>
      )}
    </div>
  );
};
