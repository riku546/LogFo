"use client";

import type { RoadmapMilestone } from "../api/roadmapApi";

const STATUS_LABELS: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  IN_PROGRESS:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
};

const isTaskStatus = (
  value: string,
): value is "TODO" | "IN_PROGRESS" | "DONE" => {
  return value === "TODO" || value === "IN_PROGRESS" || value === "DONE";
};

export interface MilestoneCardProps {
  milestone: RoadmapMilestone;
  milestoneIndex: number;
  isEditing: boolean;
  onChangeTaskStatus: (
    milestoneIndex: number,
    taskIndex: number,
    status: "TODO" | "IN_PROGRESS" | "DONE",
  ) => void;
  onChangeTaskTitle: (
    milestoneIndex: number,
    taskIndex: number,
    title: string,
  ) => void;
  onRemoveTask: (milestoneIndex: number, taskIndex: number) => void;
  onAddTask: (milestoneIndex: number) => void;
  onTaskClick?: (task: { id?: string; title: string; status: string }) => void;
}

/**
 * タスクアイテムの編集UI
 */
const TaskEditingView = ({
  task,
  taskIndex,
  milestoneIndex,
  onChangeTaskStatus,
  onChangeTaskTitle,
  onRemoveTask,
}: {
  task: { title: string; status: string };
  taskIndex: number;
  milestoneIndex: number;
  onChangeTaskStatus: MilestoneCardProps["onChangeTaskStatus"];
  onChangeTaskTitle: MilestoneCardProps["onChangeTaskTitle"];
  onRemoveTask: MilestoneCardProps["onRemoveTask"];
}) => (
  <>
    <select
      value={task.status}
      onChange={(event) =>
        isTaskStatus(event.currentTarget.value) &&
        onChangeTaskStatus(milestoneIndex, taskIndex, event.currentTarget.value)
      }
      className="cursor-pointer rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
    >
      <option value="TODO">未着手</option>
      <option value="IN_PROGRESS">進行中</option>
      <option value="DONE">完了</option>
    </select>
    <input
      type="text"
      value={task.title}
      onChange={(event) =>
        onChangeTaskTitle(milestoneIndex, taskIndex, event.target.value)
      }
      className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
    />
    <button
      type="button"
      onClick={() => onRemoveTask(milestoneIndex, taskIndex)}
      className="cursor-pointer text-red-400 hover:text-red-600"
      aria-label={`タスク「${task.title}」を削除`}
    >
      ✕
    </button>
  </>
);

/**
 * タスクアイテムの表示UI
 */
const TaskDisplayView = ({
  task,
}: {
  task: { title: string; status: string; estimatedHours?: number | null };
}) => (
  <>
    <span
      className={`h-5 w-5 shrink-0 rounded ${
        task.status === "DONE"
          ? "bg-green-500"
          : task.status === "IN_PROGRESS"
            ? "bg-amber-400"
            : "border-2 border-slate-300 dark:border-slate-600"
      }`}
    />
    <span
      className={`flex-1 text-sm ${
        task.status === "DONE"
          ? "text-slate-400 line-through"
          : "text-slate-700 dark:text-slate-300"
      }`}
    >
      {task.title}
    </span>
    <div className="flex items-center gap-2">
      {task.estimatedHours && (
        <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          {task.estimatedHours}h
        </span>
      )}
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-400 opacity-40 transition-all group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <title>記録する</title>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
    </div>
  </>
);

/**
 * タスクアイテムのコンポーネント
 */
const TaskListItem = ({
  task,
  taskIndex,
  milestoneIndex,
  isEditing,
  onChangeTaskStatus,
  onChangeTaskTitle,
  onRemoveTask,
  onTaskClick,
}: {
  task: {
    id?: string;
    title: string;
    status: string;
    estimatedHours?: number | null;
  };
  taskIndex: number;
  milestoneIndex: number;
  isEditing: boolean;
  onChangeTaskStatus: MilestoneCardProps["onChangeTaskStatus"];
  onChangeTaskTitle: MilestoneCardProps["onChangeTaskTitle"];
  onRemoveTask: MilestoneCardProps["onRemoveTask"];
  onTaskClick?: MilestoneCardProps["onTaskClick"];
}) => (
  <li
    className={`group flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/50 ${!isEditing && onTaskClick ? "cursor-pointer transition-all hover:bg-blue-50/50 hover:shadow-sm dark:hover:bg-blue-900/10" : ""}`}
    onClick={() => !isEditing && onTaskClick && onTaskClick(task)}
    onKeyDown={(event) =>
      event.key === "Enter" && !isEditing && onTaskClick && onTaskClick(task)
    }
    role={!isEditing && onTaskClick ? "button" : undefined}
    tabIndex={!isEditing && onTaskClick ? 0 : undefined}
  >
    {isEditing ? (
      <TaskEditingView
        task={task}
        taskIndex={taskIndex}
        milestoneIndex={milestoneIndex}
        onChangeTaskStatus={onChangeTaskStatus}
        onChangeTaskTitle={onChangeTaskTitle}
        onRemoveTask={onRemoveTask}
      />
    ) : (
      <TaskDisplayView task={task} />
    )}
  </li>
);

/**
 * マイルストーンカードのPresentationalコンポーネント
 * 閲覧モードと編集モードの両方に対応
 */
export const MilestoneCard = ({
  milestone,
  milestoneIndex,
  isEditing,
  onChangeTaskStatus,
  onChangeTaskTitle,
  onRemoveTask,
  onAddTask,
  onTaskClick,
}: MilestoneCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-sm font-bold text-white">
          {milestoneIndex + 1}
        </span>
        <h3 className="flex-1 text-lg font-bold text-slate-800 dark:text-slate-100">
          {milestone.title}
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[milestone.status]}`}
        >
          {STATUS_LABELS[milestone.status]}
        </span>
      </div>

      {milestone.description && (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {milestone.description}
        </p>
      )}

      <ul className="space-y-2">
        {milestone.tasks.map((task, taskIndex) => (
          <TaskListItem
            key={task.id || `task-${milestoneIndex}-${taskIndex}`}
            task={task}
            taskIndex={taskIndex}
            milestoneIndex={milestoneIndex}
            isEditing={isEditing}
            onChangeTaskStatus={onChangeTaskStatus}
            onChangeTaskTitle={onChangeTaskTitle}
            onRemoveTask={onRemoveTask}
            onTaskClick={onTaskClick}
          />
        ))}
      </ul>

      {isEditing && (
        <button
          type="button"
          onClick={() => onAddTask(milestoneIndex)}
          className="mt-3 cursor-pointer text-sm text-blue-500 hover:text-blue-600"
        >
          + タスクを追加
        </button>
      )}
    </div>
  );
};
