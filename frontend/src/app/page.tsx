"use client";

import { useTheme } from "./theme-provider";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200 via-white to-white p-4 transition-all duration-500 dark:from-slate-700 dark:via-slate-900 dark:to-slate-950">
      <div className="glass flex w-full max-w-md flex-col gap-6 rounded-2xl p-10">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            LogFo
          </h1>
          <button
            type="button"
            onClick={toggleTheme}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-600 dark:text-slate-400"
              >
                <title>Switch to dark mode</title>
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-600 dark:text-slate-400"
              >
                <title>Switch to light mode</title>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-slate-700 dark:text-slate-300">
          日々の学習ログを、信頼できるポートフォリオに変換します。
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 shadow-lg shadow-blue-500/20"
          >
            無料で始める
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-slate-200 bg-white/50 px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
          >
            プロジェクトを見る
          </button>
        </div>
      </div>
    </div>
  );
}
