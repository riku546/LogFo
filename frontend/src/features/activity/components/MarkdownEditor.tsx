"use client";

import Markdown from "react-markdown";

export interface MarkdownEditorProps {
  content: string;
  isPreview: boolean;
  onContentChange: (value: string) => void;
  onTogglePreview: () => void;
  placeholder?: string;
}

/**
 * Markdown入力 + プレビュー切り替えエディタ
 * react-markdownを使用してリッチなプレビューを提供します。
 */
export const MarkdownEditor = ({
  content,
  isPreview,
  onContentChange,
  onTogglePreview,
  placeholder = "今日の学びを書いてみましょう...\n\n## 学習した内容\n\n## 気づき・所感\n\n## 参考資料",
}: MarkdownEditorProps) => {
  return (
    <div className="flex flex-col gap-2">
      {/* ツールバー */}
      <div className="flex items-center justify-between rounded-t-xl border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Markdown対応
        </span>
        <button
          type="button"
          onClick={onTogglePreview}
          className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-all ${
            isPreview
              ? "bg-blue-500 text-white"
              : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {isPreview ? "編集" : "プレビュー"}
        </button>
      </div>

      {/* エディタ / プレビュー */}
      {isPreview ? (
        <div className="min-h-[200px] rounded-b-xl border border-t-0 border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-slate-800 prose-p:text-slate-600 dark:prose-headings:text-slate-100 dark:prose-p:text-slate-300">
            {content ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-slate-400">
                プレビューするコンテンツがありません
              </p>
            )}
          </div>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] resize-y rounded-b-xl border border-t-0 border-slate-200 bg-white p-4 font-mono text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-blue-700 dark:focus:ring-blue-900"
        />
      )}
    </div>
  );
};
