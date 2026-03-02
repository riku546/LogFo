export interface ProgressBarProps {
  progress: number;
}

/**
 * 全体の進捗を表示するプログレスバーコンポーネント
 */
export const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          全体の進捗
        </span>
        <span className="text-sm font-bold text-blue-600">{progress}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
