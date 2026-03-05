"use client";

export interface SummaryEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
}

/**
 * サマリー編集コンポーネント
 * 生成されたテキストをMarkdownで手動編集し保存するためのUI。
 */
export const SummaryEditor = ({
  title,
  onTitleChange,
  content,
  onContentChange,
  onSave,
  onReset,
  isSaving,
}: SummaryEditorProps) => {
  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          サマリー編集
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
        >
          リセット
        </button>
      </div>

      {/* タイトル入力 */}
      <div className="space-y-2">
        <label
          htmlFor="summary-title"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          タイトル
        </label>
        <input
          id="summary-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="サマリーのタイトルを入力..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Markdown編集エリア */}
      <div className="space-y-2">
        <label
          htmlFor="summary-content"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          内容 (Markdown)
        </label>
        <textarea
          id="summary-content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="サマリーの内容を編集..."
          rows={16}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 font-mono leading-relaxed transition-all hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-y"
        />
      </div>

      {/* 保存ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !title.trim() || !content.trim()}
          className="flex-1 cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isSaving ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
};
