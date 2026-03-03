import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  MarkdownEditor,
  type MarkdownEditorProps,
} from "@/features/activity/components/MarkdownEditor";

const createDefaultProps = (
  overrides?: Partial<MarkdownEditorProps>,
): MarkdownEditorProps => ({
  content: "",
  isPreview: false,
  onContentChange: vi.fn(),
  onTogglePreview: vi.fn(),
  ...overrides,
});

describe("MarkdownEditor", () => {
  describe("入力モード", () => {
    it("テキストエリアが表示される", () => {
      const props = createDefaultProps();
      render(React.createElement(MarkdownEditor, props));

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("入力内容が反映される", () => {
      const props = createDefaultProps({ content: "テスト内容" });
      render(React.createElement(MarkdownEditor, props));

      expect(screen.getByDisplayValue("テスト内容")).toBeInTheDocument();
    });

    it("入力するとonContentChangeが呼ばれる", () => {
      const handleChange = vi.fn();
      const props = createDefaultProps({ onContentChange: handleChange });
      render(React.createElement(MarkdownEditor, props));

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "新しい内容" },
      });
      expect(handleChange).toHaveBeenCalledWith("新しい内容");
    });

    it("プレビューボタンが表示される", () => {
      const props = createDefaultProps();
      render(React.createElement(MarkdownEditor, props));

      expect(screen.getByText("プレビュー")).toBeInTheDocument();
    });

    it("プレビューボタンをクリックするとonTogglePreviewが呼ばれる", () => {
      const handleToggle = vi.fn();
      const props = createDefaultProps({ onTogglePreview: handleToggle });
      render(React.createElement(MarkdownEditor, props));

      fireEvent.click(screen.getByText("プレビュー"));
      expect(handleToggle).toHaveBeenCalledOnce();
    });
  });

  describe("プレビューモード", () => {
    it("テキストエリアが非表示になる", () => {
      const props = createDefaultProps({ isPreview: true });
      render(React.createElement(MarkdownEditor, props));

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("Markdownコンテンツがレンダリングされる", () => {
      const props = createDefaultProps({
        isPreview: true,
        content: "## 見出し\n\nコンテンツ本文",
      });
      render(React.createElement(MarkdownEditor, props));

      expect(screen.getByText("見出し")).toBeInTheDocument();
      expect(screen.getByText("コンテンツ本文")).toBeInTheDocument();
    });

    it("コンテンツが空の場合、プレースホルダーが表示される", () => {
      const props = createDefaultProps({ isPreview: true, content: "" });
      render(React.createElement(MarkdownEditor, props));

      expect(
        screen.getByText("プレビューするコンテンツがありません"),
      ).toBeInTheDocument();
    });

    it("編集ボタンが表示される", () => {
      const props = createDefaultProps({ isPreview: true });
      render(React.createElement(MarkdownEditor, props));

      expect(screen.getByText("編集")).toBeInTheDocument();
    });
  });
});
