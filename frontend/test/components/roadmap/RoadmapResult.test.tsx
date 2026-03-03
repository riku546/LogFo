import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  RoadmapResult,
  type RoadmapResultProps,
} from "@/features/roadmap/components/RoadmapResult";

const createDefaultProps = (
  overrides?: Partial<RoadmapResultProps>,
): RoadmapResultProps => ({
  generatedRoadmap: {
    summary: "テストサマリー: React中心の学習計画",
    milestones: [
      {
        title: "Step 1: 基礎固め",
        description: "TypeScriptの基本を学ぶ",
        tasks: [
          { title: "TypeScript入門", estimatedHours: 20 },
          { title: "React Hooks学習", estimatedHours: 15 },
        ],
      },
      {
        title: "Step 2: 実践",
        description: "ポートフォリオを作成する",
        tasks: [{ title: "Next.jsでブログ構築", estimatedHours: 30 }],
      },
    ],
  },
  isGenerating: false,
  isSaving: false,
  onSave: vi.fn(),
  onReset: vi.fn(),
  ...overrides,
});

describe("RoadmapResult", () => {
  it("サマリーが表示される", () => {
    const props = createDefaultProps();
    render(React.createElement(RoadmapResult, props));

    expect(
      screen.getByText("テストサマリー: React中心の学習計画"),
    ).toBeInTheDocument();
  });

  it("マイルストーンが番号付きで表示される", () => {
    const props = createDefaultProps();
    render(React.createElement(RoadmapResult, props));

    expect(screen.getByText("Step 1: 基礎固め")).toBeInTheDocument();
    expect(screen.getByText("Step 2: 実践")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("タスクと所要時間が表示される", () => {
    const props = createDefaultProps();
    render(React.createElement(RoadmapResult, props));

    expect(screen.getByText("TypeScript入門")).toBeInTheDocument();
    expect(screen.getByText("20h")).toBeInTheDocument();
    expect(screen.getByText("React Hooks学習")).toBeInTheDocument();
    expect(screen.getByText("15h")).toBeInTheDocument();
    expect(screen.getByText("Next.jsでブログ構築")).toBeInTheDocument();
    expect(screen.getByText("30h")).toBeInTheDocument();
  });

  it("再生成ボタンをクリックするとonResetが呼ばれる", () => {
    const handleReset = vi.fn();
    const props = createDefaultProps({ onReset: handleReset });
    render(React.createElement(RoadmapResult, props));

    fireEvent.click(screen.getByText("再生成する"));
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it("保存ボタンをクリックするとonSaveが呼ばれる", () => {
    const handleSave = vi.fn();
    const props = createDefaultProps({ onSave: handleSave });
    render(React.createElement(RoadmapResult, props));

    fireEvent.click(screen.getByText("このロードマップを保存する"));
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it("保存中はボタンが無効化され「保存中...」と表示される", () => {
    const props = createDefaultProps({ isSaving: true });
    render(React.createElement(RoadmapResult, props));

    const saveButton = screen.getByText("保存中...");
    expect(saveButton).toBeInTheDocument();
    expect(saveButton.closest("button")).toBeDisabled();
  });
});
