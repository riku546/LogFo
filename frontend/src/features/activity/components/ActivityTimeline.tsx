"use client";

import type { ActivityLogItem } from "../api/activityApi";
import { ActivityCard } from "./ActivityCard";

export interface ActivityTimelineProps {
  activityLogs: ActivityLogItem[];
  isLoading: boolean;
  onUpdate: (activityId: string, content: string) => void;
  onDelete: (activityId: string) => void;
}

/**
 * 過去の活動記録をタイムライン形式で表示するコンポーネント
 */
export const ActivityTimeline = ({
  activityLogs,
  isLoading,
  onUpdate,
  onDelete,
}: ActivityTimelineProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <svg
            className="h-4 w-4 animate-spin"
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

  if (activityLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 dark:border-slate-700">
        <span className="mb-2 text-3xl">📝</span>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          まだ活動記録がありません
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          上のエディタから今日の学びを記録しましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {/* タイムラインのライン */}
      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-blue-300 to-transparent" />

      {activityLogs.map((log) => (
        <div key={log.id} className="relative pl-7">
          <ActivityCard
            activityLog={log}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};
