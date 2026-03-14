"use client";

import { Plus, Sparkles, Trash2, User, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { PortfolioSettings } from "../api/portfolioApi";
import { QiitaIcon, ZennIcon } from "./icons";

export interface PortfolioPublicViewProps {
  settings: PortfolioSettings;
  isEditable?: boolean;
  onUpdateProfile?: (updates: Partial<PortfolioSettings["profile"]>) => void;
  onUpdateSocialLinks?: (
    updates: Partial<NonNullable<PortfolioSettings["profile"]["socialLinks"]>>,
  ) => void;
  onUpdateGeneratedContent?: (
    updates: Partial<PortfolioSettings["generatedContent"]>,
  ) => void;
}

type TabType = "profile" | "prStrength";

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

const formatPeriodLabel = (
  careerStory: PortfolioSettings["profile"]["careerStories"][number],
): string => {
  if (careerStory.periodFrom && careerStory.isCurrent) {
    return `${careerStory.periodFrom} - 現在`;
  }

  if (careerStory.periodFrom && careerStory.periodTo) {
    return `${careerStory.periodFrom} - ${careerStory.periodTo}`;
  }

  if (careerStory.periodFrom) {
    return careerStory.periodFrom;
  }

  if (careerStory.periodTo) {
    return `- ${careerStory.periodTo}`;
  }

  return "期間未設定";
};

/**
 * 経歴ストーリーの新規入力用データを生成する
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

const socialLinkKeys = [
  "github",
  "x",
  "zenn",
  "qiita",
  "atcoder",
  "website",
] as const;

type SocialLinkKey = (typeof socialLinkKeys)[number];

const socialLinkPlaceholder: Record<SocialLinkKey, string> = {
  github: "https://github.com/username",
  x: "https://x.com/username",
  zenn: "https://zenn.dev/username",
  qiita: "https://qiita.com/username",
  atcoder: "https://atcoder.jp/users/username",
  website: "https://example.com",
};

interface ProfileHeaderProps {
  profile: PortfolioSettings["profile"];
  isEditable: boolean;
  onUpdateProfile?: (updates: Partial<PortfolioSettings["profile"]>) => void;
  onUpdateSocialLinks?: (
    updates: Partial<NonNullable<PortfolioSettings["profile"]["socialLinks"]>>,
  ) => void;
}

const ProfileHeader = ({
  profile,
  isEditable,
  onUpdateProfile,
  onUpdateSocialLinks,
}: ProfileHeaderProps) => (
  <section className="glass relative overflow-hidden rounded-2xl border border-white/50 dark:border-white/15 p-6 md:p-8">
    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />
    <div className="absolute -top-24 -right-20 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

    <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
      {profile.avatarUrl ? (
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/60 dark:border-white/20 shadow-lg shrink-0">
          <Image
            src={profile.avatarUrl}
            alt={`${profile.displayName}のアバター`}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-600 shrink-0" />
      )}

      <div className="space-y-3 flex-1">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-300">
          Portfolio
        </p>

        {isEditable ? (
          <div className="space-y-3">
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) =>
                onUpdateProfile?.({ displayName: e.target.value })
              }
              placeholder="表示名"
              className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />

            <textarea
              value={profile.bio || ""}
              onChange={(e) => onUpdateProfile?.({ bio: e.target.value })}
              placeholder="自己紹介"
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-y"
            />

            <input
              type="url"
              value={profile.avatarUrl || ""}
              onChange={(e) => onUpdateProfile?.({ avatarUrl: e.target.value })}
              placeholder="アバターURL"
              className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {socialLinkKeys.map((key) => (
                <input
                  key={key}
                  type="url"
                  value={profile.socialLinks?.[key] || ""}
                  onChange={(e) =>
                    onUpdateSocialLinks?.({ [key]: e.target.value })
                  }
                  placeholder={socialLinkPlaceholder[key]}
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white font-(--font-poppins) leading-tight">
              {profile.displayName || "名前未設定"}
            </h1>

            {profile.bio && (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-w-3xl">
                {profile.bio}
              </p>
            )}

            {profile.socialLinks && (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-300/70 bg-white/70 text-slate-600 hover:text-blue-600 hover:border-blue-400 dark:border-white/15 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:text-blue-300 transition-all duration-300 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      role="img"
                      aria-label="GitHub"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                )}

                {profile.socialLinks.x && (
                  <a
                    href={profile.socialLinks.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-300/70 bg-white/70 text-slate-600 hover:text-blue-600 hover:border-blue-400 dark:border-white/15 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:text-blue-300 transition-all duration-300 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      role="img"
                      aria-label="X (Twitter)"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}

                {profile.socialLinks.zenn && (
                  <a
                    href={profile.socialLinks.zenn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-300/70 bg-white/70 text-slate-600 hover:text-blue-600 hover:border-blue-400 dark:border-white/15 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:text-blue-300 transition-all duration-300 cursor-pointer"
                    title="Zenn"
                  >
                    <ZennIcon className="w-5 h-5" />
                  </a>
                )}

                {profile.socialLinks.qiita && (
                  <a
                    href={profile.socialLinks.qiita}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-300/70 bg-white/70 text-[#55C500] hover:border-[#55C500] dark:border-white/15 dark:bg-slate-800/60 dark:text-[#7ADF3E] transition-all duration-300 cursor-pointer"
                    title="Qiita"
                  >
                    <QiitaIcon className="w-5 h-5" />
                  </a>
                )}

                {profile.socialLinks.atcoder && (
                  <a
                    href={profile.socialLinks.atcoder}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-10 px-3 rounded-xl border border-slate-300/70 bg-white/70 hover:border-blue-400 dark:border-white/15 dark:bg-slate-800/60 transition-all duration-300 cursor-pointer"
                    title="AtCoder"
                  >
                    <div className="relative h-5 w-[60px]">
                      <Image
                        src="/atcoder_logo.png"
                        alt="AtCoder"
                        fill
                        className="object-contain dark:hidden"
                        sizes="60px"
                      />
                      <Image
                        src="/atcoder_logo_white.png"
                        alt="AtCoder"
                        fill
                        className="object-contain hidden dark:block"
                        sizes="60px"
                      />
                    </div>
                  </a>
                )}

                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-300/70 bg-white/70 text-slate-600 hover:text-blue-600 hover:border-blue-400 dark:border-white/15 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:text-blue-300 transition-all duration-300 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      role="img"
                      aria-label="Website"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </section>
);

interface CareerSectionProps {
  careerStories: PortfolioSettings["profile"]["careerStories"];
  isEditable: boolean;
  onUpdateProfile?: (updates: Partial<PortfolioSettings["profile"]>) => void;
}

const CareerSection = ({
  careerStories,
  isEditable,
  onUpdateProfile,
}: CareerSectionProps) => {
  const handleAddCareerStory = () => {
    onUpdateProfile?.({
      careerStories: [...careerStories, createEmptyCareerStory()],
    });
  };

  const handleRemoveCareerStory = (storyId: string) => {
    onUpdateProfile?.({
      careerStories: careerStories.filter((story) => story.id !== storyId),
    });
  };

  const handleUpdateCareerStory = (
    storyId: string,
    updates: Partial<PortfolioSettings["profile"]["careerStories"][number]>,
  ) => {
    onUpdateProfile?.({
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

  return (
    <section className="glass rounded-2xl border border-white/50 dark:border-white/15 p-6 md:p-7 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-(--font-poppins)">
          経歴ストーリー
        </h2>
        {isEditable && (
          <button
            type="button"
            onClick={handleAddCareerStory}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300/70 dark:border-slate-600/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 transition-colors duration-200 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            追加
          </button>
        )}
      </div>

      {careerStories.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 py-6 border border-dashed border-slate-300/80 dark:border-slate-600 rounded-xl text-center">
          経歴はまだ登録されていません
        </p>
      ) : isEditable ? (
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

              <input
                type="text"
                value={careerStory.title}
                onChange={(e) =>
                  handleUpdateCareerStory(careerStory.id, {
                    title: e.target.value,
                  })
                }
                placeholder="役割・職種"
                className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              />

              <input
                type="text"
                value={careerStory.organization}
                onChange={(e) =>
                  handleUpdateCareerStory(careerStory.id, {
                    organization: e.target.value,
                  })
                }
                placeholder="所属・組織"
                className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="month"
                  value={careerStory.periodFrom}
                  onChange={(e) =>
                    handleUpdateCareerStory(careerStory.id, {
                      periodFrom: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                />
                <input
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

              <textarea
                rows={4}
                value={careerStory.story}
                onChange={(e) =>
                  handleUpdateCareerStory(careerStory.id, {
                    story: e.target.value,
                  })
                }
                placeholder="取り組みや背景を記載してください"
                className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-y"
              />
            </div>
          ))}
        </div>
      ) : (
        <ol className="relative space-y-4 pl-7">
          <span className="absolute left-2 top-1 bottom-1 w-px bg-blue-400/70" />
          {careerStories.map((careerStory) => (
            <li key={careerStory.id} className="relative">
              <span className="absolute -left-[1.42rem] top-5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-slate-800" />
              <article className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/65 dark:bg-slate-800/65 backdrop-blur-sm p-4 md:p-5 space-y-2.5">
                <p className="text-xs font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-300">
                  {formatPeriodLabel(careerStory)}
                </p>
                {careerStory.title && (
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {careerStory.title}
                  </h3>
                )}
                {careerStory.organization && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {careerStory.organization}
                  </p>
                )}
                {careerStory.story && (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {careerStory.story}
                  </p>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

interface SkillsSectionProps {
  skills: string[];
  isEditable: boolean;
  onUpdateProfile?: (updates: Partial<PortfolioSettings["profile"]>) => void;
}

const SkillsSection = ({
  skills,
  isEditable,
  onUpdateProfile,
}: SkillsSectionProps) => {
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    const normalizedSkill = skillInput.trim();
    if (!normalizedSkill) return;
    if (skills.includes(normalizedSkill)) {
      setSkillInput("");
      return;
    }

    onUpdateProfile?.({ skills: [...skills, normalizedSkill] });
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    onUpdateProfile?.({
      skills: skills.filter((currentSkill) => currentSkill !== skill),
    });
  };

  return (
    <section className="glass rounded-2xl border border-white/50 dark:border-white/15 p-6 md:p-7 space-y-5">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-(--font-poppins)">
        スキル
      </h2>

      {isEditable && (
        <div className="flex gap-2">
          <input
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
      )}

      {skills.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 py-6 border border-dashed border-slate-300/80 dark:border-slate-600 rounded-xl text-center">
          スキルはまだ登録されていません
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2.5">
          {skills.map((skill) => (
            <li key={skill}>
              {isEditable ? (
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-600 px-3 py-1 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                >
                  {skill}
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="inline-flex px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-400/30 bg-blue-50/80 dark:bg-blue-500/10 text-sm font-medium text-blue-700 dark:text-blue-200">
                  {skill}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const ProfileTab = ({
  profile,
  isEditable,
  onUpdateProfile,
}: {
  profile: PortfolioSettings["profile"];
  isEditable: boolean;
  onUpdateProfile?: (updates: Partial<PortfolioSettings["profile"]>) => void;
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <CareerSection
      careerStories={profile.careerStories ?? []}
      isEditable={isEditable}
      onUpdateProfile={onUpdateProfile}
    />
    <SkillsSection
      skills={profile.skills ?? []}
      isEditable={isEditable}
      onUpdateProfile={onUpdateProfile}
    />
  </div>
);

const NarrativeTab = ({
  generatedContent,
  isEditable,
  onUpdateGeneratedContent,
}: {
  generatedContent: PortfolioSettings["generatedContent"];
  isEditable: boolean;
  onUpdateGeneratedContent?: (
    updates: Partial<PortfolioSettings["generatedContent"]>,
  ) => void;
}) => {
  const visibleSections = useMemo(
    () =>
      generatedSectionDefinitions.filter(
        (section) =>
          isEditable || generatedContent[section.key].trim().length > 0,
      ),
    [generatedContent, isEditable],
  );

  return (
    <section className="glass rounded-2xl border border-white/50 dark:border-white/15 p-6 md:p-7 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-(--font-poppins)">
        PR・強み
      </h2>

      {visibleSections.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 py-6 border border-dashed border-slate-300/80 dark:border-slate-600 rounded-xl text-center">
          まだ自己PRや強みの文章がありません
        </p>
      ) : (
        <ul className="space-y-4">
          {visibleSections.map((section) => (
            <li
              key={section.key}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/65 dark:bg-slate-800/65 p-4 md:p-5"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {section.title}
              </h3>
              {isEditable ? (
                <textarea
                  rows={5}
                  value={generatedContent[section.key]}
                  onChange={(e) =>
                    onUpdateGeneratedContent?.({
                      [section.key]: e.target.value,
                    })
                  }
                  placeholder={section.placeholder}
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-y"
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {generatedContent[section.key]}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export const PortfolioPublicView = ({
  settings,
  isEditable = false,
  onUpdateProfile,
  onUpdateSocialLinks,
  onUpdateGeneratedContent,
}: PortfolioPublicViewProps) => {
  const { profile, generatedContent } = settings;
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-5 p-6 md:p-10 lg:p-12">
      <ProfileHeader
        profile={profile}
        isEditable={isEditable}
        onUpdateProfile={onUpdateProfile}
        onUpdateSocialLinks={onUpdateSocialLinks}
      />

      <div className="glass rounded-2xl border border-white/50 dark:border-white/15 p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-700/60"
            }`}
          >
            <User className="w-4 h-4" />
            経歴・スキル
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prStrength")}
            className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeTab === "prStrength"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-700/60"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            PR・強み
          </button>
        </div>
      </div>

      <main className="min-h-[320px]">
        {activeTab === "profile" ? (
          <ProfileTab
            profile={profile}
            isEditable={isEditable}
            onUpdateProfile={onUpdateProfile}
          />
        ) : (
          <NarrativeTab
            generatedContent={generatedContent}
            isEditable={isEditable}
            onUpdateGeneratedContent={onUpdateGeneratedContent}
          />
        )}
      </main>

      <footer className="glass rounded-2xl border border-white/50 dark:border-white/15 text-center text-xs text-slate-500 dark:text-slate-400 py-3.5">
        {isEditable
          ? "編集モード: 中央エリアで内容を直接編集できます"
          : "LogFo Portfolio"}
      </footer>
    </div>
  );
};
