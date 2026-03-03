import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import type { ActivityLogItem } from "@/features/activity/api/activityApi";
import {
  ActivityTimeline,
  type ActivityTimelineProps,
} from "@/features/activity/components/ActivityTimeline";

const sampleLogs: ActivityLogItem[] = [
  {
    id: "log-1",
    userId: "user-1",
    taskId: "task-1",
    content: "## 1日目\n\nJavaScript基礎を学んだ。",
    loggedDate: "2026-03-03",
    createdAt: "2026-03-03T10:00:00.000Z",
    updatedAt: "2026-03-03T10:00:00.000Z",
  },
  {
    id: "log-2",
    userId: "user-1",
    taskId: "task-1",
    content: "## 2日目\n\nTypeScriptの型システムを学んだ。",
    loggedDate: "2026-03-02",
    createdAt: "2026-03-02T10:00:00.000Z",
    updatedAt: "2026-03-02T10:00:00.000Z",
  },
];

const createDefaultProps = (
  overrides?: Partial<ActivityTimelineProps>,
): ActivityTimelineProps => ({
  activityLogs: sampleLogs,
  isLoading: false,
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
  ...overrides,
});

describe("ActivityTimeline", () => {
  it("活動記録一覧が表示される", () => {
    const props = createDefaultProps();
    render(React.createElement(ActivityTimeline, props));

    expect(screen.getByText("1日目")).toBeInTheDocument();
    expect(screen.getByText("2日目")).toBeInTheDocument();
  });

  it("ローディング中はスピナーが表示される", () => {
    const props = createDefaultProps({ isLoading: true, activityLogs: [] });
    render(React.createElement(ActivityTimeline, props));

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("記録が0件の場合は空メッセージが表示される", () => {
    const props = createDefaultProps({ activityLogs: [] });
    render(React.createElement(ActivityTimeline, props));

    expect(screen.getByText("まだ活動記録がありません")).toBeInTheDocument();
  });

  it("各記録にMarkdownコンテンツがレンダリングされる", () => {
    const props = createDefaultProps();
    render(React.createElement(ActivityTimeline, props));

    expect(screen.getByText("JavaScript基礎を学んだ。")).toBeInTheDocument();
    expect(
      screen.getByText("TypeScriptの型システムを学んだ。"),
    ).toBeInTheDocument();
  });
});
