"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import type { SummaryItem } from "@/features/summary/api/summaryApi";
import type {
  PortfolioGeneratedSectionKey,
  PortfolioSettings,
} from "../api/portfolioApi";

export interface PortfolioChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  targetSection: PortfolioGeneratedSectionKey;
  status?: "streaming" | "done" | "error";
}

export interface ConfigSidebarProps {
  settings: PortfolioSettings;
  onUpdateGeneration: (
    updates: Partial<PortfolioSettings["generation"]>,
  ) => void;
  availableSummaries: SummaryItem[];
  isStreaming: boolean;
  messages: PortfolioChatMessage[];
  onSendMessage: () => void;
  onApplyMessage: (messageId: string) => void;
}

const sectionLabelMap: Record<PortfolioGeneratedSectionKey, string> = {
  selfPr: "自己PR",
  strengths: "強み",
  learnings: "学び",
  futureVision: "将来",
};

/**
 * ポートフォリオ生成用のサイドバー
 * AIチャット入力とサマリー選択、候補適用の操作を提供します。
 */
export const ConfigSidebar = ({
  settings,
  onUpdateGeneration,
  availableSummaries,
  isStreaming,
  messages,
  onSendMessage,
  onApplyMessage,
}: ConfigSidebarProps) => {
  const selectedSummaryIds = settings.generation.selectedSummaryIds ?? [];
  const chatInput = settings.generation.chatInput ?? "";
  const targetSection = settings.generation.targetSection ?? "selfPr";
  const canSend = chatInput.trim().length > 0 && !isStreaming;

  /**
   * サマリー選択を切り替える
   */
  const handleToggleSummary = (summaryId: string) => {
    if (selectedSummaryIds.includes(summaryId)) {
      onUpdateGeneration({
        selectedSummaryIds: selectedSummaryIds.filter((id) => id !== summaryId),
      });
      return;
    }

    if (selectedSummaryIds.length >= 5) {
      return;
    }

    onUpdateGeneration({
      selectedSummaryIds: [...selectedSummaryIds, summaryId],
    });
  };

  return (
    <aside className="relative flex h-full min-h-0 w-full shrink-0 flex-col border-r border-white/10 bg-white/55 p-4 backdrop-blur-xl dark:border-white/5 dark:bg-slate-800/55 lg:w-[26rem] lg:p-6">
      <div className="glass rounded-xl border border-white/50 dark:border-white/15 px-4 py-3">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-300">
          AI Chat
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          対象項目を選択して生成し、本文へ適用できます
        </p>
      </div>

      <section className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="glass rounded-xl border border-white/50 p-4 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
              チャットを開始すると、ここに時系列でメッセージが表示されます。
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl border p-3 ${
                  message.role === "user"
                    ? "ml-6 border-blue-500/40 bg-blue-500/10"
                    : "mr-6 border-white/50 bg-white/70 dark:border-white/15 dark:bg-slate-700/50"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                    {message.role === "user" ? "You" : "AI"} ・
                    {sectionLabelMap[message.targetSection]}
                  </p>
                  {message.status === "streaming" && (
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      生成中...
                    </p>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-100">
                  {message.content || "..."}
                </p>
                {message.role === "assistant" && message.status === "done" && (
                  <button
                    type="button"
                    onClick={() => onApplyMessage(message.id)}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg border border-blue-500/50 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors duration-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/20"
                  >
                    この文章を適用
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="glass mt-4 rounded-xl border border-white/50 p-4 dark:border-white/15">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            メッセージ入力
          </h3>
        </div>

        <label
          htmlFor="target-section"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          対象項目
        </label>
        <select
          id="target-section"
          value={targetSection}
          onChange={(e) =>
            onUpdateGeneration({
              targetSection: e.target.value as PortfolioGeneratedSectionKey,
            })
          }
          className="mb-3 w-full rounded-xl border border-white/50 bg-white/80 px-3 py-2 text-slate-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/15 dark:bg-slate-700/80 dark:text-slate-100"
        >
          <option value="selfPr">自己PR</option>
          <option value="strengths">強み</option>
          <option value="learnings">学び</option>
          <option value="futureVision">将来</option>
        </select>

        <label
          htmlFor="chat-input"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          自由入力テキスト（必須）
        </label>
        <textarea
          id="chat-input"
          rows={4}
          value={chatInput}
          onChange={(e) => onUpdateGeneration({ chatInput: e.target.value })}
          placeholder="例: 採用担当に伝わるよう、具体的な成果を交えて作成してください"
          className="w-full resize-y rounded-xl border border-white/50 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/15 dark:bg-slate-700/80 dark:text-slate-100"
        />

        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            生成に使うサマリー（任意、最大5件）
          </p>
          {availableSummaries.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              利用可能なサマリーがありません
            </p>
          ) : (
            <div className="max-h-28 space-y-2 overflow-y-auto pr-1">
              {availableSummaries.map((summary) => {
                const isSelected = selectedSummaryIds.includes(summary.id);
                const canSelectMore =
                  isSelected || selectedSummaryIds.length < 5;

                return (
                  <label
                    key={summary.id}
                    htmlFor={`summary-${summary.id}`}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg p-1.5 text-sm transition-colors ${
                      canSelectMore
                        ? "hover:bg-white/40 dark:hover:bg-slate-700/40"
                        : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    <input
                      id={`summary-${summary.id}`}
                      type="checkbox"
                      checked={isSelected}
                      disabled={!canSelectMore}
                      onChange={() => handleToggleSummary(summary.id)}
                      className="cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 dark:border-slate-600"
                    />
                    <span className="truncate text-slate-700 dark:text-slate-300">
                      {summary.title || "無題のサマリー"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedSummaryIds.length}/5件 選択中
          </p>
        </div>

        <button
          type="button"
          onClick={onSendMessage}
          disabled={!canSend}
          className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {isStreaming ? "生成中..." : "送信して生成"}
        </button>
      </section>
    </aside>
  );
};
