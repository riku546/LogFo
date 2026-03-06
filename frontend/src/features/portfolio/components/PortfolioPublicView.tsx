"use client";

import Image from "next/image";
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

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4 lg:px-0">
      {/* プロフィールセクション（常時表示） */}
      <section className="glass rounded-2xl p-8 text-center space-y-4">
        {profile.avatarUrl && (
          <img
            src={profile.avatarUrl}
            alt={`${profile.displayName}のアバター`}
            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/30 dark:border-white/10 shadow-lg"
          />
        )}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-(--font-poppins)">
          {profile.displayName || "名前未設定"}
        </h1>
        {profile.bio && (
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            {profile.bio}
          </p>
        )}
        {/* SNSリンク */}
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

      {/* サマリーセクション */}
      {summaries.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl text-slate-900 dark:text-white font-(--font-poppins)">
            サマリー
          </h2>
          {summaries.map((summary) => (
            <article
              key={summary.id}
              className="glass rounded-2xl p-6 space-y-2"
            >
              {summary.title && (
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {summary.title}
                </h3>
              )}
              <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {summary.content}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ロードマップセクション */}
      {roadmaps.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-(--font-poppins)">
            ロードマップ
          </h2>
          {roadmaps.map((roadmap) => (
            <article
              key={roadmap.id}
              className="glass rounded-2xl p-6 space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  目標
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {roadmap.goalState}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  現状
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {roadmap.currentState}
                </span>
              </div>
              {roadmap.summary && (
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm whitespace-pre-wrap pt-2 border-t border-white/10 dark:border-white/5">
                  {roadmap.summary}
                </p>
              )}
            </article>
          ))}
        </section>
      )}

      {/* プロフィールのみの場合のフッター */}
      {summaries.length === 0 && roadmaps.length === 0 && (
        <div className="text-center text-slate-400 dark:text-slate-500 py-8">
          <p>まだコンテンツが追加されていません</p>
        </div>
      )}

      {/* フッター */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-600 pt-4">
        Powered by <span className="font-semibold">LogFo</span>
      </footer>
    </div>
  );
};
