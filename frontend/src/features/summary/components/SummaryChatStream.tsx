"use client";

export interface SummaryChatStreamProps {
  streamedText: string;
  isGenerating: boolean;
}

/**
 * AIストリーミング生成のプレビュー表示コンポーネント
 * テキストがリアルタイムに表示されます。
 */
export const SummaryChatStream = ({
  streamedText,
  isGenerating,
}: SummaryChatStreamProps) => {
  if (!(streamedText || isGenerating)) return null;

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          生成プレビュー
        </h2>
        {isGenerating && (
          <span className="flex items-center gap-2 text-sm text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            生成中
          </span>
        )}
      </div>

      <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800/50">
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap wrap-break-word text-slate-700 dark:text-slate-300 leading-relaxed">
          {streamedText || (
            <span className="text-slate-400 italic">
              サマリーを生成しています...
            </span>
          )}
          {isGenerating && (
            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
};
