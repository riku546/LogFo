import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  ActivityCard,
  type ActivityCardProps,
} from "@/features/activity/components/ActivityCard";

const createDefaultProps = (
  overrides?: Partial<ActivityCardProps>,
): ActivityCardProps => ({
  activityLog: {
    id: "log-1",
    userId: "user-1",
    taskId: "task-1",
    content: "## 今日の学び\n\nReact Hooksを復習した。",
    loggedDate: "2026-03-03",
    createdAt: "2026-03-03T10:00:00.000Z",
    updatedAt: "2026-03-03T10:00:00.000Z",
  },
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
  ...overrides,
});

describe("ActivityCard", () => {
  describe("閲覧モード", () => {
    it("日付がフォーマットされて表示される", () => {
      const props = createDefaultProps();
      render(React.createElement(ActivityCard, props));

      expect(screen.getByText("2026年3月3日")).toBeInTheDocument();
    });

    it("Markdownコンテンツがレンダリングされる", () => {
      const props = createDefaultProps();
      render(React.createElement(ActivityCard, props));

      expect(screen.getByText("今日の学び")).toBeInTheDocument();
      expect(screen.getByText("React Hooksを復習した。")).toBeInTheDocument();
    });

    it("編集ボタンが存在する（ホバーで表示）", () => {
      const props = createDefaultProps();
      render(React.createElement(ActivityCard, props));

      expect(screen.getByText("編集")).toBeInTheDocument();
    });

    it("削除ボタンが存在する", () => {
      const props = createDefaultProps();
      render(React.createElement(ActivityCard, props));

      expect(screen.getByText("削除")).toBeInTheDocument();
    });
  });

  describe("編集モード", () => {
    it("編集ボタンをクリックするとテキストエリアが表示される", () => {
      const props = createDefaultProps();
      render(React.createElement(ActivityCard, props));

      fireEvent.click(screen.getByText("編集"));

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByDisplayValue(/今日の学び/)).toBeInTheDocument();
    });

    it("キャンセルボタンで閲覧モードに戻る", () => {
      const props = createDefaultProps();
      render(React.createElement(ActivityCard, props));

      fireEvent.click(screen.getByText("編集"));
      fireEvent.click(screen.getByText("キャンセル"));

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("保存ボタンでonUpdateが呼ばれる", () => {
      const handleUpdate = vi.fn();
      const props = createDefaultProps({ onUpdate: handleUpdate });
      render(React.createElement(ActivityCard, props));

      fireEvent.click(screen.getByText("編集"));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "更新後の内容" },
      });
      fireEvent.click(screen.getByText("保存"));

      expect(handleUpdate).toHaveBeenCalledWith("log-1", "更新後の内容");
    });
  });

  describe("削除", () => {
    it("削除ボタンでonDeleteが呼ばれる", () => {
      const handleDelete = vi.fn();
      const props = createDefaultProps({ onDelete: handleDelete });
      render(React.createElement(ActivityCard, props));

      fireEvent.click(screen.getByText("削除"));

      expect(handleDelete).toHaveBeenCalledWith("log-1");
    });
  });
});
