"use client";

import type { RoadmapListItem } from "@/features/roadmap/api/roadmapApi";
import type { SummaryItem } from "@/features/summary/api/summaryApi";
import type { PortfolioSettings } from "../api/portfolioApi";

export interface ConfigSidebarProps {
  settings: PortfolioSettings;
  onUpdateProfile: (updates: Partial<PortfolioSettings["profile"]>) => void;
  onUpdateSocialLinks: (
    updates: Partial<NonNullable<PortfolioSettings["profile"]["socialLinks"]>>,
  ) => void;
  onUpdateSections: (updates: Partial<PortfolioSettings["sections"]>) => void;
  availableSummaries: SummaryItem[];
  availableRoadmaps: RoadmapListItem[];
}

/**
 * ポートフォリオ設定の入力サイドバー
 * プロフィール情報、SNSリンク、表示セクションの選択を行います。
 */
export const ConfigSidebar = ({
  settings,
  onUpdateProfile,
  onUpdateSocialLinks,
  onUpdateSections,
  availableSummaries,
  availableRoadmaps,
}: ConfigSidebarProps) => {
  /**
   * サマリーの選択トグル
   */
  const handleToggleSummary = (summaryId: string) => {
    const currentIds = settings.sections.summaryIds;
    const updatedIds = currentIds.includes(summaryId)
      ? currentIds.filter((id) => id !== summaryId)
      : [...currentIds, summaryId];
    onUpdateSections({ summaryIds: updatedIds });
  };

  /**
   * ロードマップの選択トグル
   */
  const handleToggleRoadmap = (roadmapId: string) => {
    const currentIds = settings.sections.roadmapIds;
    const updatedIds = currentIds.includes(roadmapId)
      ? currentIds.filter((id) => id !== roadmapId)
      : [...currentIds, roadmapId];
    onUpdateSections({ roadmapIds: updatedIds });
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6 overflow-y-auto p-4 lg:p-6 border-r border-white/10 dark:border-white/5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
      {/* プロフィール設定セクション */}
      <section>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          プロフィール
        </h3>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              表示名 *
            </label>
            <input
              id="displayName"
              type="text"
              value={settings.profile.displayName}
              onChange={(e) => onUpdateProfile({ displayName: e.target.value })}
              placeholder="あなたの名前"
              className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              自己紹介
            </label>
            <textarea
              id="bio"
              value={settings.profile.bio || ""}
              onChange={(e) => onUpdateProfile({ bio: e.target.value })}
              placeholder="簡単な自己紹介..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="avatarUrl"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              アバターURL
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={settings.profile.avatarUrl || ""}
              onChange={(e) => onUpdateProfile({ avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.png"
              className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />
          </div>
        </div>
      </section>

      {/* SNSリンク設定 */}
      <section>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          SNSリンク
        </h3>
        <div className="space-y-3">
          {(
            ["github", "x", "zenn", "qiita", "atcoder", "website"] as const
          ).map((key) => (
            <div key={key}>
              <label
                htmlFor={`social-${key}`}
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize"
              >
                {key}
              </label>
              <input
                id={`social-${key}`}
                type="url"
                value={settings.profile.socialLinks?.[key] || ""}
                onChange={(e) => onUpdateSocialLinks({ [key]: e.target.value })}
                placeholder={`https://${key === "website" ? "yoursite.com" : `${key}.com/username`}`}
                className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 表示セクション選択 */}
      <section>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          サマリー
        </h3>
        {availableSummaries.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            選択可能なサマリーがありません
          </p>
        ) : (
          <div className="space-y-2">
            {availableSummaries.map((summary) => (
              <label
                key={summary.id}
                htmlFor={`summary-${summary.id}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer"
              >
                <input
                  id={`summary-${summary.id}`}
                  type="checkbox"
                  checked={settings.sections.summaryIds.includes(summary.id)}
                  onChange={() => handleToggleSummary(summary.id)}
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                  {summary.title || "無題のサマリー"}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          ロードマップ
        </h3>
        {availableRoadmaps.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            選択可能なロードマップがありません
          </p>
        ) : (
          <div className="space-y-2">
            {availableRoadmaps.map((roadmap) => (
              <label
                key={roadmap.id}
                htmlFor={`roadmap-${roadmap.id}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer"
              >
                <input
                  id={`roadmap-${roadmap.id}`}
                  type="checkbox"
                  checked={settings.sections.roadmapIds.includes(roadmap.id)}
                  onChange={() => handleToggleRoadmap(roadmap.id)}
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                  {roadmap.goalState}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
};
