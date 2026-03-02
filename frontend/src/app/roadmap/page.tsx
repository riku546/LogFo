"use client";

import Link from "next/link";
import { useRoadmapList } from "@/features/roadmap/hooks/useRoadmapList";

export default function RoadmapListPage() {
  const { roadmapList, isLoading } = useRoadmapList();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-200 via-white to-white transition-all duration-500 dark:from-slate-700 dark:via-slate-900 dark:to-slate-950">
        <div className="flex items-center gap-3 text-slate-500 glass px-6 py-4 rounded-2xl shadow-lg">
          <svg
            className="h-6 w-6 animate-spin text-primary"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <title>読み込み中</title>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="font-medium dark:text-slate-300">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-200 via-white to-white py-12 transition-all duration-500 dark:from-slate-700 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="mx-auto max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              マイロードマップ
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              作成した学習ロードマップの一覧
            </p>
          </div>
          <Link
            href="/roadmap/generate"
            className="inline-flex items-center justify-center cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
          >
            <span className="mr-1.5 text-lg">+</span> 新しいロードマップ
          </Link>
        </div>

        {/* ロードマップ一覧 */}
        {roadmapList.length === 0 ? (
          <div className="glass rounded-2xl border-dashed p-16 text-center">
            <p className="mb-4 text-lg text-slate-600 dark:text-slate-400 font-medium">
              まだロードマップがありません
            </p>
            <Link
              href="/roadmap/generate"
              className="inline-flex cursor-pointer text-primary font-semibold hover:underline"
            >
              最初のロードマップを作成する →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {roadmapList.map((roadmap) => (
              <Link
                key={roadmap.id}
                href={`/roadmap/${roadmap.id}`}
                className="group block cursor-pointer glass rounded-2xl p-6 transition-all hover:border-primary/30 hover:shadow-xl dark:hover:border-primary/40 relative overflow-hidden"
              >
                {/* アクセントの光沢効果 */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 -translate-x-full group-hover:translate-x-full duration-1000" />

                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white dark:group-hover:text-blue-400">
                      {roadmap.goalState}
                    </h2>
                    <div className="mt-1 flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mr-2">
                        現在の状態
                      </span>
                      {roadmap.currentState}
                    </div>
                    {roadmap.summary && (
                      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {roadmap.summary}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-primary group-hover:text-white dark:bg-slate-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <title>View details</title>
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </div>
                <div className="mt-6 flex items-center text-xs font-medium text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5"
                  >
                    <title>Created date</title>
                    <rect width="18" height="18" x="3" y="4" r="2" />
                    <path d="M3 10h18" />
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                  </svg>
                  作成日:{" "}
                  {new Date(roadmap.createdAt).toLocaleDateString("ja-JP")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
