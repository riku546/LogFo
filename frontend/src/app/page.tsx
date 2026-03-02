export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-200 via-white to-white p-4 transition-all duration-500 dark:from-slate-700 dark:via-slate-900 dark:to-slate-950">
      <div className="glass flex w-full max-w-md flex-col gap-6 rounded-2xl p-10">
        <p className="text-xl font-medium text-slate-800 dark:text-slate-200">
          学習の軌跡を、信頼に。
        </p>

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
