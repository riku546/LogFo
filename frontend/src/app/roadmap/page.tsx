"use client";

import Link from "next/link";
import { useRoadmapList } from "@/features/roadmap/hooks/useRoadmapList";

export default function RoadmapListPage() {
  const { roadmapList, isLoading } = useRoadmapList();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="flex items-center gap-3 text-slate-500">
          <svg
            className="h-6 w-6 animate-spin"
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
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="mx-auto max-w-4xl px-4">
        {/* ヘッダー */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
              マイロードマップ
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              作成した学習ロードマップの一覧
            </p>
          </div>
          <Link
            href="/roadmap/generate"
            className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl"
          >
            + 新しいロードマップ
          </Link>
        </div>

        {/* ロードマップ一覧 */}
        {roadmapList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <p className="mb-4 text-lg text-slate-500 dark:text-slate-400">
              まだロードマップがありません
            </p>
            <Link
              href="/roadmap/generate"
              className="cursor-pointer text-blue-500 hover:text-blue-600"
            >
              最初のロードマップを作成する →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {roadmapList.map((roadmap) => (
              <Link
                key={roadmap.id}
                href={`/roadmap/${roadmap.id}`}
                className="group block cursor-pointer rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-blue-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-blue-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                      {roadmap.goalState}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {roadmap.currentState}
                    </p>
                    {roadmap.summary && (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {roadmap.summary}
                      </p>
                    )}
                  </div>
                  <span className="ml-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <div className="mt-4 text-xs text-slate-400">
                  作成:{" "}
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
