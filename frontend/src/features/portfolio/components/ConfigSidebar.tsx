"use client";

import { Plus, Sparkles, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { SummaryItem } from "@/features/summary/api/summaryApi";
import type {
  PortfolioGeneratedSectionKey,
  PortfolioSettings,
} from "../api/portfolioApi";

export interface ConfigSidebarProps {
  settings: PortfolioSettings;
  onUpdateProfile: (updates: Partial<PortfolioSettings["profile"]>) => void;
  onUpdateSocialLinks: (
    updates: Partial<NonNullable<PortfolioSettings["profile"]["socialLinks"]>>,
  ) => void;
  onUpdateGeneration: (
    updates: Partial<PortfolioSettings["generation"]>,
  ) => void;
  onUpdateGeneratedContent: (
    updates: Partial<PortfolioSettings["generatedContent"]>,
  ) => void;
  availableSummaries: SummaryItem[];
  isGeneratingContent: boolean;
  generatingTargetSection: PortfolioGeneratedSectionKey | "all" | null;
  onGenerateContent: (targetSection?: PortfolioGeneratedSectionKey) => void;
}

const generatedSectionDefinitions = [
  {
    key: "selfPr" as const,
    title: "自己PR",
    placeholder: "あなたの強みと実績をもとにした自己PRを記載します",
  },
  {
    key: "strengths" as const,
    title: "強み",
    placeholder: "技術的・行動的な強みを記載します",
  },
  {
    key: "learnings" as const,
    title: "学び",
    placeholder: "学習を通じて得た知見や気づきを記載します",
  },
  {
    key: "futureVision" as const,
    title: "将来",
    placeholder: "今後挑戦したいことやキャリア展望を記載します",
  },
];

/**
 * 経歴ストーリーの新規入力用データを生成する
 *
 * @returns 空の経歴ストーリー
 */
const createEmptyCareerStory =
  (): PortfolioSettings["profile"]["careerStories"][number] => ({
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `career-${Date.now()}`,
    title: "",
    organization: "",
    periodFrom: "",
    periodTo: "",
    isCurrent: false,
    story: "",
  });

/**
 * ポートフォリオ設定の入力サイドバー
 * プロフィールとAI文章生成の設定・編集を行います。
 */
export const ConfigSidebar = ({
  settings,
  onUpdateProfile,
  onUpdateSocialLinks,
  onUpdateGeneration,
  onUpdateGeneratedContent,
  availableSummaries,
  isGeneratingContent,
  generatingTargetSection,
  onGenerateContent,
}: ConfigSidebarProps) => {
  const [skillInput, setSkillInput] = useState("");

  const careerStories = settings.profile.careerStories ?? [];
  const skills = settings.profile.skills ?? [];
  const selectedSummaryIds = settings.generation.selectedSummaryIds ?? [];
  const canGenerateContent =
    selectedSummaryIds.length > 0 ||
    settings.generation.selfPrDraft.trim().length > 0;

  /**
   * サマリー選択を切り替える
   */
  const handleToggleSummary = (summaryId: string) => {
    const currentIds = settings.generation.selectedSummaryIds;

    if (currentIds.includes(summaryId)) {
      onUpdateGeneration({
        selectedSummaryIds: currentIds.filter((id) => id !== summaryId),
      });
      return;
    }

    if (currentIds.length >= 5) {
      return;
    }

    onUpdateGeneration({ selectedSummaryIds: [...currentIds, summaryId] });
  };

  /**
   * 経歴ストーリーを追加する
   */
  const handleAddCareerStory = () => {
    onUpdateProfile({
      careerStories: [...careerStories, createEmptyCareerStory()],
    });
  };

  /**
   * 経歴ストーリーを削除する
   */
  const handleRemoveCareerStory = (storyId: string) => {
    onUpdateProfile({
      careerStories: careerStories.filter((story) => story.id !== storyId),
    });
  };

  /**
   * 経歴ストーリーの一部フィールドを更新する
   */
  const handleUpdateCareerStory = (
    storyId: string,
    updates: Partial<PortfolioSettings["profile"]["careerStories"][number]>,
  ) => {
    onUpdateProfile({
      careerStories: careerStories.map((story) => {
        if (story.id !== storyId) return story;

        const mergedStory = {
          ...story,
          ...updates,
        };

        if (updates.isCurrent) {
          return { ...mergedStory, periodTo: "" };
        }

        return mergedStory;
      }),
    });
  };

  /**
   * スキルを追加する
   */
  const handleAddSkill = () => {
    const normalizedSkill = skillInput.trim();
    if (!normalizedSkill) return;
    if (skills.includes(normalizedSkill)) {
      setSkillInput("");
      return;
    }

    onUpdateProfile({
      skills: [...skills, normalizedSkill],
    });
    setSkillInput("");
  };

  /**
   * スキルを削除する
   */
  const handleRemoveSkill = (skill: string) => {
    onUpdateProfile({
      skills: skills.filter((currentSkill) => currentSkill !== skill),
    });
  };

  /**
   * 生成文章の単一項目を更新する
   */
  const handleUpdateGeneratedSection = (
    sectionKey: PortfolioGeneratedSectionKey,
    content: string,
  ) => {
    onUpdateGeneratedContent({
      [sectionKey]: content,
    } as Pick<PortfolioSettings["generatedContent"], typeof sectionKey>);
  };

  return (
    <aside className="relative w-full lg:w-[26rem] shrink-0 space-y-6 overflow-y-auto p-4 lg:p-6 border-r border-white/10 dark:border-white/5 bg-white/55 dark:bg-slate-800/55 backdrop-blur-xl">
      <div className="glass rounded-xl border border-white/50 dark:border-white/15 px-4 py-3">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-300">
          Builder
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          入力内容は右側のプレビューへリアルタイム反映されます
        </p>
      </div>

      <section className="glass rounded-xl border border-white/50 dark:border-white/15 p-4 space-y-3">
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

      <section className="glass rounded-xl border border-white/50 dark:border-white/15 p-4 space-y-3">
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

      <section className="glass rounded-xl border border-white/50 dark:border-white/15 p-4 space-y-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            経歴ストーリー
          </h3>
          <button
            type="button"
            onClick={handleAddCareerStory}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300/70 dark:border-slate-600/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 transition-colors duration-200 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            経歴を追加
          </button>
        </div>

        {careerStories.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            経歴はまだ追加されていません
          </p>
        ) : (
          <div className="space-y-4">
            {careerStories.map((careerStory, index) => (
              <div
                key={careerStory.id}
                className="space-y-3 border-l-2 border-slate-200 dark:border-slate-700 pl-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    ストーリー {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveCareerStory(careerStory.id)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    削除
                  </button>
                </div>

                <div>
                  <label
                    htmlFor={`career-title-${careerStory.id}`}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    役割・職種
                  </label>
                  <input
                    id={`career-title-${careerStory.id}`}
                    type="text"
                    value={careerStory.title}
                    onChange={(e) =>
                      handleUpdateCareerStory(careerStory.id, {
                        title: e.target.value,
                      })
                    }
                    placeholder="例: フロントエンドエンジニア"
                    className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`career-org-${careerStory.id}`}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    所属・組織
                  </label>
                  <input
                    id={`career-org-${careerStory.id}`}
                    type="text"
                    value={careerStory.organization}
                    onChange={(e) =>
                      handleUpdateCareerStory(careerStory.id, {
                        organization: e.target.value,
                      })
                    }
                    placeholder="例: LogFo Inc."
                    className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`career-from-${careerStory.id}`}
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      開始時期
                    </label>
                    <input
                      id={`career-from-${careerStory.id}`}
                      type="month"
                      value={careerStory.periodFrom}
                      onChange={(e) =>
                        handleUpdateCareerStory(careerStory.id, {
                          periodFrom: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`career-to-${careerStory.id}`}
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      終了時期
                    </label>
                    <input
                      id={`career-to-${careerStory.id}`}
                      type="month"
                      value={careerStory.periodTo || ""}
                      disabled={careerStory.isCurrent}
                      onChange={(e) =>
                        handleUpdateCareerStory(careerStory.id, {
                          periodTo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={careerStory.isCurrent}
                    onChange={(e) =>
                      handleUpdateCareerStory(careerStory.id, {
                        isCurrent: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
                  />
                  現在も継続中
                </label>

                <div>
                  <label
                    htmlFor={`career-story-${careerStory.id}`}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    ストーリー
                  </label>
                  <textarea
                    id={`career-story-${careerStory.id}`}
                    rows={4}
                    value={careerStory.story}
                    onChange={(e) =>
                      handleUpdateCareerStory(careerStory.id, {
                        story: e.target.value,
                      })
                    }
                    placeholder="Wantedlyの経歴のように、取り組みや背景をストーリーで記載してください"
                    className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-y"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass rounded-xl border border-white/50 dark:border-white/15 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          スキル
        </h3>

        <div className="flex gap-2">
          <label htmlFor="skill-input" className="sr-only">
            スキル入力
          </label>
          <input
            id="skill-input"
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              handleAddSkill();
            }}
            placeholder="例: React"
            className="flex-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            aria-label="スキルを追加"
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </div>

        {skills.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            スキルはまだ追加されていません
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li key={skill}>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-600 px-3 py-1 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                  aria-label={`${skill}を削除`}
                >
                  {skill}
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-xl border border-white/50 dark:border-white/15 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            AI文章生成
          </h3>
        </div>

        <div className="space-y-2">
          <p className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            生成に使うサマリー（最大5件）
          </p>
          {availableSummaries.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              利用可能なサマリーがありません
            </p>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {availableSummaries.map((summary) => {
                const isSelected = selectedSummaryIds.includes(summary.id);
                const canSelectMore =
                  isSelected || selectedSummaryIds.length < 5;

                return (
                  <label
                    key={summary.id}
                    htmlFor={`summary-${summary.id}`}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 ${
                      canSelectMore
                        ? "hover:bg-white/40 dark:hover:bg-slate-700/40 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <input
                      id={`summary-${summary.id}`}
                      type="checkbox"
                      checked={isSelected}
                      disabled={!canSelectMore}
                      onChange={() => handleToggleSummary(summary.id)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
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

        <div>
          <label
            htmlFor="self-pr-draft"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            自己PR下書き（任意）
          </label>
          <textarea
            id="self-pr-draft"
            rows={4}
            value={settings.generation.selfPrDraft}
            onChange={(e) =>
              onUpdateGeneration({
                selfPrDraft: e.target.value,
              })
            }
            placeholder="サマリー未選択時はここに下書きを入力してください"
            className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-y"
          />
        </div>

        <button
          type="button"
          onClick={() => onGenerateContent()}
          disabled={isGeneratingContent || !canGenerateContent}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
        >
          {isGeneratingContent && generatingTargetSection === "all"
            ? "4項目を生成中..."
            : "4項目を生成"}
        </button>

        {!canGenerateContent && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            サマリーを1件以上選択するか、自己PR下書きを入力してください。
          </p>
        )}

        <div className="space-y-4 pt-2">
          {generatedSectionDefinitions.map((section) => (
            <div key={section.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`generated-${section.key}`}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {section.title}
                </label>
                <button
                  type="button"
                  onClick={() => onGenerateContent(section.key)}
                  disabled={isGeneratingContent || !canGenerateContent}
                  className="rounded-lg border border-slate-300/70 dark:border-slate-600/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
                >
                  {isGeneratingContent &&
                  generatingTargetSection === section.key
                    ? "再生成中..."
                    : "この項目を再生成"}
                </button>
              </div>

              <textarea
                id={`generated-${section.key}`}
                rows={4}
                value={settings.generatedContent[section.key]}
                onChange={(e) =>
                  handleUpdateGeneratedSection(section.key, e.target.value)
                }
                placeholder={section.placeholder}
                className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-y"
              />
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};
