import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  MilestoneCard,
  type MilestoneCardProps,
} from "@/features/roadmap/components/MilestoneCard";

const createDefaultProps = (
  overrides?: Partial<MilestoneCardProps>,
): MilestoneCardProps => ({
  milestone: {
    id: "milestone-1",
    title: "フロントエンド基礎",
    description: "React/TypeScriptの基礎を学ぶ",
    status: "TODO",
    orderIndex: 0,
    tasks: [
      {
        id: "task-1",
        title: "TypeScript入門",
        estimatedHours: 20,
        status: "TODO",
        orderIndex: 0,
      },
      {
        id: "task-2",
        title: "React Hooks復習",
        estimatedHours: 10,
        status: "DONE",
        orderIndex: 1,
      },
    ],
  },
  milestoneIndex: 0,
  isEditing: false,
  onChangeTaskStatus: vi.fn(),
  onChangeTaskTitle: vi.fn(),
  onRemoveTask: vi.fn(),
  onAddTask: vi.fn(),
  ...overrides,
});

describe("MilestoneCard", () => {
  describe("閲覧モード", () => {
    it("マイルストーンのタイトルと説明が表示される", () => {
      const props = createDefaultProps();
      render(React.createElement(MilestoneCard, props));

      expect(screen.getByText("フロントエンド基礎")).toBeInTheDocument();
      expect(
        screen.getByText("React/TypeScriptの基礎を学ぶ"),
      ).toBeInTheDocument();
    });

    it("マイルストーン番号が正しく表示される", () => {
      const props = createDefaultProps({ milestoneIndex: 2 });
      render(React.createElement(MilestoneCard, props));

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("タスク一覧が表示される", () => {
      const props = createDefaultProps();
      render(React.createElement(MilestoneCard, props));

      expect(screen.getByText("TypeScript入門")).toBeInTheDocument();
      expect(screen.getByText("React Hooks復習")).toBeInTheDocument();
      expect(screen.getByText("20h")).toBeInTheDocument();
      expect(screen.getByText("10h")).toBeInTheDocument();
    });

    it("ステータスラベルが表示される", () => {
      const props = createDefaultProps();
      render(React.createElement(MilestoneCard, props));

      expect(screen.getByText("未着手")).toBeInTheDocument();
    });

    it("完了タスクにline-throughスタイルが適用される", () => {
      const props = createDefaultProps();
      render(React.createElement(MilestoneCard, props));

      const doneTask = screen.getByText("React Hooks復習");
      expect(doneTask.className).toContain("line-through");
    });

    it("編集ボタンが表示されない", () => {
      const props = createDefaultProps();
      render(React.createElement(MilestoneCard, props));

      expect(screen.queryByText("+ タスクを追加")).not.toBeInTheDocument();
    });

    it("各タスクに記録アイコンが表示される", () => {
      const props = createDefaultProps();
      render(React.createElement(MilestoneCard, props));

      const recordIcons = screen.getAllByTitle("記録する");
      expect(recordIcons.length).toBe(2); // 2つのタスクがあるため
    });
  });

  describe("編集モード", () => {
    it("記録アイコンが表示されない", () => {
      const props = createDefaultProps({ isEditing: true });
      render(React.createElement(MilestoneCard, props));

      expect(screen.queryByTitle("記録する")).not.toBeInTheDocument();
    });

    it("タスク追加ボタンが表示される", () => {
      const props = createDefaultProps({ isEditing: true });
      render(React.createElement(MilestoneCard, props));

      expect(screen.getByText("+ タスクを追加")).toBeInTheDocument();
    });

    it("タスク追加ボタンをクリックするとonAddTaskが呼ばれる", () => {
      const handleAddTask = vi.fn();
      const props = createDefaultProps({
        isEditing: true,
        onAddTask: handleAddTask,
      });
      render(React.createElement(MilestoneCard, props));

      fireEvent.click(screen.getByText("+ タスクを追加"));
      expect(handleAddTask).toHaveBeenCalledWith(0);
    });

    it("削除ボタンをクリックするとonRemoveTaskが呼ばれる", () => {
      const handleRemoveTask = vi.fn();
      const props = createDefaultProps({
        isEditing: true,
        onRemoveTask: handleRemoveTask,
      });
      render(React.createElement(MilestoneCard, props));

      const deleteButtons = screen.getAllByRole("button", {
        name: /タスク.*を削除/,
      });
      fireEvent.click(deleteButtons[0]);
      expect(handleRemoveTask).toHaveBeenCalledWith(0, 0);
    });

    it("ステータスセレクトが表示される", () => {
      const props = createDefaultProps({ isEditing: true });
      render(React.createElement(MilestoneCard, props));

      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBe(2); // 2つのタスク
    });
  });
});
