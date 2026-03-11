"use client";

import type {
  PortfolioSettings,
  PublicPortfolioData,
} from "../api/portfolioApi";
import { PortfolioPublicView } from "./PortfolioPublicView";

export interface LivePreviewPaneProps {
  settings: PortfolioSettings;
  summaries?: PublicPortfolioData["summaries"];
  roadmaps?: PublicPortfolioData["roadmaps"];
}

/**
 * ポートフォリオのリアルタイムプレビューパネル
 * ConfigSidebarの設定に基づいてPortfolioPublicViewを即座に描画します。
 *
 * Usage:
 * <LivePreviewPane settings={settings} />
 */
export const LivePreviewPane = ({
  settings,
  summaries = [],
  roadmaps = [],
}: LivePreviewPaneProps) => {
  return (
    <div className="relative flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-0">
      <div className="absolute top-6 right-10 h-44 w-44 rounded-full bg-blue-400/15 blur-3xl" />
      <div className="absolute bottom-4 left-6 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative p-4 lg:p-8">
        <div className="mb-5 flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Live Preview
          </span>
        </div>

        <div className="glass rounded-2xl border border-white/50 dark:border-white/15 shadow-xl overflow-hidden">
          <PortfolioPublicView
            settings={settings}
            summaries={summaries}
            roadmaps={roadmaps}
          />
        </div>
      </div>
    </div>
  );
};
