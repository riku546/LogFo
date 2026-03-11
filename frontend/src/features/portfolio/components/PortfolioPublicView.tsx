"use client";

import { ArrowLeft, Map as MapIcon, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type {
  PortfolioSettings,
  PublicPortfolioData,
} from "../api/portfolioApi";
import { QiitaIcon, ZennIcon } from "./icons";

export interface PortfolioPublicViewProps {
  settings: PortfolioSettings;
  summaries?: PublicPortfolioData["summaries"];
  roadmaps?: PublicPortfolioData["roadmaps"];
}

type TabType = "profile" | "roadmaps";

/**
 * プロフィール情報とSNSリンクを表示するヘッダーコンポーネント
 */
const ProfileHeader = ({
  profile,
}: {
  profile: PortfolioSettings["profile"];
}) => (
  <section className="glass rounded-2xl p-8 text-center space-y-4">
    {profile.avatarUrl && (
      <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white/30 dark:border-white/10 shadow-lg">
        <Image
          src={profile.avatarUrl}
          alt={`${profile.displayName}のアバター`}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
    )}
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-(--font-poppins)">
      {profile.displayName || "名前未設定"}
    </h1>
    {profile.bio && (
      <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed whitespace-pre-wrap">
        {profile.bio}
      </p>
    )}
    {profile.socialLinks && (
      <div className="flex justify-center flex-wrap gap-4 pt-2">
        {profile.socialLinks.github && (
          <a
            href={profile.socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
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
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
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
            className="hover:opacity-80 transition-opacity duration-200 p-0.5"
            title="Zenn"
          >
            <ZennIcon className="w-6 h-6" />
          </a>
        )}
        {profile.socialLinks.qiita && (
          <a
            href={profile.socialLinks.qiita}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#55C500] dark:text-white hover:opacity-80 transition-opacity duration-200 p-0.5"
            title="Qiita"
          >
            <QiitaIcon className="w-6 h-6" />
          </a>
        )}
        {profile.socialLinks.atcoder && (
          <a
            href={profile.socialLinks.atcoder}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity duration-200 p-0.5 flex items-center"
            title="AtCoder"
          >
            <div className="relative h-6 w-[71px] flex items-center justify-center">
              <Image
                src="/atcoder_logo.png"
                alt="AtCoder"
                fill
                className="object-contain dark:hidden"
                sizes="71px"
              />
              <Image
                src="/atcoder_logo_white.png"
                alt="AtCoder"
                fill
                className="object-contain hidden dark:block"
                sizes="71px"
              />
            </div>
          </a>
        )}
        {profile.socialLinks.website && (
          <a
            href={profile.socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
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
  </section>
);

const RoadmapDetail = ({
  roadmap,
  onBack,
}: {
  roadmap: PublicPortfolioData["roadmaps"][0];
  onBack: () => void;
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors w-fit"
    >
      <ArrowLeft className="w-4 h-4" />
      一覧に戻る
    </button>
    <section className="glass rounded-2xl p-8 space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <span className="px-3 py-1 text-xs font-bold tracking-wider rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 w-fit shrink-0">
            GOAL
          </span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
            {roadmap.goalState}
          </h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 opacity-90">
          <span className="px-3 py-1 text-xs font-bold tracking-wider rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-fit shrink-0">
            NOW
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-snug text-lg">
            {roadmap.currentState}
          </p>
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 dark:border-white/10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block" />
          サマリー詳細
        </h3>
        {roadmap.summary ? (
          <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300 whitespace-pre-wrap">
            {roadmap.summary}
          </div>
        ) : (
          <p className="text-slate-400 dark:text-slate-500 text-sm italic">
            サマリーがまだ生成されていません
          </p>
        )}
      </div>
    </section>
  </div>
);

const ProfileTab = ({
  summaries,
}: {
  summaries: PublicPortfolioData["summaries"];
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {summaries.length > 0 ? (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-(--font-poppins) mb-2">
          経歴・スキル
        </h2>
        <div className="space-y-6">
          {summaries.map((summary) => (
            <article
              key={summary.id}
              className="glass rounded-2xl p-8 space-y-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              {summary.title && (
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {summary.title}
                </h3>
              )}
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {summary.content}
              </div>
            </article>
          ))}
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-16 glass rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-800">
        <User className="w-12 h-12 mb-4 opacity-50" />
        <p>経歴・スキルのサマリーがまだ追加されていません</p>
      </div>
    )}
  </div>
);

const RoadmapsTab = ({
  roadmaps,
  onSelectRoadmap,
}: {
  roadmaps: PublicPortfolioData["roadmaps"];
  onSelectRoadmap: (id: string) => void;
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {roadmaps.length > 0 ? (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-(--font-poppins) mb-2">
          作成したロードマップ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roadmaps.map((roadmap) => (
            <button
              type="button"
              key={roadmap.id}
              onClick={() => onSelectRoadmap(roadmap.id)}
              className="text-left w-full glass rounded-2xl p-6 sm:p-8 space-y-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-blue-500/20 dark:hover:border-blue-400/20 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 w-fit drop-shadow-sm">
                    GOAL
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                    {roadmap.goalState}
                  </h3>
                </div>
                <div className="space-y-1.5 opacity-90">
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-fit">
                    NOW
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                    {roadmap.currentState}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1 duration-300 pt-4">
                詳細を確認する{" "}
                <ArrowLeft className="w-4 h-4 ml-1.5 rotate-180" />
              </div>
            </button>
          ))}
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-16 glass rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-800">
        <MapIcon className="w-12 h-12 mb-4 opacity-50" />
        <p>ロードマップがまだ追加されていません</p>
      </div>
    )}
  </div>
);

/**
 * ポートフォリオの公開表示コンポーネント
 * ビルダーのライブプレビューと、公開ページの両方で使用されます。
 */
export const PortfolioPublicView = ({
  settings,
  summaries = [],
  roadmaps = [],
}: PortfolioPublicViewProps) => {
  const { profile } = settings;
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(
    null,
  );

  const selectedRoadmap = selectedRoadmapId
    ? roadmaps.find((r) => r.id === selectedRoadmapId)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 lg:px-0">
      <ProfileHeader profile={profile} />

      <div className="flex justify-center border-b border-black/5 dark:border-white/10">
        <div className="flex space-x-12">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setSelectedRoadmapId(null);
            }}
            className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors duration-200 relative ${
              activeTab === "profile" && !selectedRoadmapId
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            経歴・スキル
            {activeTab === "profile" && !selectedRoadmapId && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roadmaps")}
            className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors duration-200 relative ${
              activeTab === "roadmaps" || selectedRoadmapId
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            ロードマップ
            {(activeTab === "roadmaps" || selectedRoadmapId) && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      <div className="pt-2 min-h-[300px]">
        {selectedRoadmapId && selectedRoadmap ? (
          <RoadmapDetail
            roadmap={selectedRoadmap}
            onBack={() => setSelectedRoadmapId(null)}
          />
        ) : activeTab === "profile" ? (
          <ProfileTab summaries={summaries} />
        ) : (
          <RoadmapsTab
            roadmaps={roadmaps}
            onSelectRoadmap={setSelectedRoadmapId}
          />
        )}
      </div>

      <footer className="text-center text-xs text-slate-400 dark:text-slate-600 pt-8 pb-4">
        Powered by <span className="font-semibold">LogFo</span>
      </footer>
    </div>
  );
};
