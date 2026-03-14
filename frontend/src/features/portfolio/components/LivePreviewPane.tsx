"use client";

import type { PortfolioSettings } from "../api/portfolioApi";
import { PortfolioPublicView } from "./PortfolioPublicView";

export interface LivePreviewPaneProps {
  settings: PortfolioSettings;
  isEditing: boolean;
  onToggleEditing: () => void;
  onUpdateProfile: (updates: Partial<PortfolioSettings["profile"]>) => void;
  onUpdateSocialLinks: (
    updates: Partial<NonNullable<PortfolioSettings["profile"]["socialLinks"]>>,
  ) => void;
  onUpdateGeneratedContent: (
    updates: Partial<PortfolioSettings["generatedContent"]>,
  ) => void;
}

/**
 * ポートフォリオのリアルタイムプレビューパネル
 * 編集モード時は中央エリアで直接編集できます。
 */
export const LivePreviewPane = ({
  settings,
  isEditing,
  onToggleEditing,
  onUpdateProfile,
  onUpdateSocialLinks,
  onUpdateGeneratedContent,
}: LivePreviewPaneProps) => {
  return (
    <div className="relative flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-0">
      <div className="absolute top-6 right-10 h-44 w-44 rounded-full bg-blue-400/15 blur-3xl" />
      <div className="absolute bottom-4 left-6 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative p-4 lg:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Live Preview
          </span>

          <button
            type="button"
            onClick={onToggleEditing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 dark:border-slate-600/80 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 transition-colors duration-200 cursor-pointer"
          >
            {isEditing ? "閲覧モードへ" : "編集モードへ"}
          </button>
        </div>

        <div className="glass rounded-2xl border border-white/50 dark:border-white/15 shadow-xl overflow-hidden">
          <PortfolioPublicView
            settings={settings}
            isEditable={isEditing}
            onUpdateProfile={onUpdateProfile}
            onUpdateSocialLinks={onUpdateSocialLinks}
            onUpdateGeneratedContent={onUpdateGeneratedContent}
          />
        </div>
      </div>
    </div>
  );
};
