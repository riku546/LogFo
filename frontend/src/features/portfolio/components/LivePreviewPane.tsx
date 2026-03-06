"use client";

import type { PortfolioSettings } from "../api/portfolioApi";
import { PortfolioPublicView } from "./PortfolioPublicView";

export interface LivePreviewPaneProps {
  settings: PortfolioSettings;
}

/**
 * ポートフォリオのリアルタイムプレビューパネル
 * ConfigSidebarの設定に基づいてPortfolioPublicViewを即座に描画します。
 *
 * Usage:
 * <LivePreviewPane settings={settings} />
 */
export const LivePreviewPane = ({ settings }: LivePreviewPaneProps) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-0">
      <div className="p-4 lg:p-8">
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            プレビュー
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-white/50 dark:border-white/10 overflow-hidden">
          <PortfolioPublicView settings={settings} />
        </div>
      </div>
    </div>
  );
};
