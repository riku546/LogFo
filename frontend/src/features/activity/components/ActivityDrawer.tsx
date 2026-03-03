"use client";

import { useCallback, useState } from "react";
import { useActivityEditor } from "../hooks/useActivityEditor";
import { useActivityTimeline } from "../hooks/useActivityTimeline";
import { ActivityTimeline } from "./ActivityTimeline";
import { MarkdownEditor } from "./MarkdownEditor";

export interface ActivityDrawerProps {
  isOpen: boolean;
  taskId: string | null;
  taskTitle: string;
  taskStatus: "TODO" | "IN_PROGRESS" | "DONE";
  onClose: () => void;
  onStatusChange?: (
    taskId: string,
    status: "TODO" | "IN_PROGRESS" | "DONE",
  ) => void;
}

const STATUS_OPTIONS = [
  {
    value: "TODO",
    label: "未着手",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  {
    value: "IN_PROGRESS",
    label: "進行中",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  {
    value: "DONE",
    label: "完了",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  },
] as const;

/**
 * ロードマップ画面からタスクをクリックした際に右からスライドして表示されるドロワー
 * タスクメタ情報 + Markdownエディタ + 活動記録タイムラインを内包
 */
export const ActivityDrawer = ({
  isOpen,
  taskId,
  taskTitle,
  taskStatus,
  onClose,
  onStatusChange,
}: ActivityDrawerProps) => {
  const { activityLogs, isLoading, handleCreate, handleUpdate, handleDelete } =
    useActivityTimeline(isOpen ? taskId : null);

  const { content, setContent, isPreview, togglePreview, clearDraft } =
    useActivityEditor(isOpen ? taskId : null);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    const today = new Date().toISOString().split("T")[0];
    await handleCreate(content, today);
    clearDraft();
    setIsSaving(false);
  }, [content, handleCreate, clearDraft]);

  const handleStatusChange = useCallback(
    (newStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
      if (taskId && onStatusChange) {
        onStatusChange(taskId, newStatus);
      }
    },
    [taskId, onStatusChange],
  );

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          onKeyDown={(event) => event.key === "Escape" && onClose()}
          aria-label="ドロワーを閉じる"
        />
      )}

      {/* ドロワー本体 */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-950 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {taskTitle}
            </h2>
            <div className="mt-2 flex gap-1.5">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusChange(option.value)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    taskStatus === option.value
                      ? `${option.color} ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-slate-950`
                      : `${option.color} opacity-50 hover:opacity-80`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="閉じる"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <title>閉じる</title>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* エディタセクション */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              📝 今日の活動を記録
            </h3>
            <MarkdownEditor
              content={content}
              isPreview={isPreview}
              onContentChange={setContent}
              onTogglePreview={togglePreview}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !content.trim()}
                className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "保存中..." : "記録を保存 ✨"}
              </button>
            </div>
          </div>

          {/* タイムラインセクション */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              📋 活動履歴
            </h3>
            <ActivityTimeline
              activityLogs={activityLogs}
              isLoading={isLoading}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </>
  );
};
