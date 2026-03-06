"use client";

export interface PublishSettingsPanelProps {
  slug: string;
  isPublic: boolean;
  isSaving: boolean;
  onSlugChange: (slug: string) => void;
  onIsPublicChange: (isPublic: boolean) => void;
  onSave: () => void;
}

/**
 * ポートフォリオの公開設定パネル
 * Slug編集、公開/非公開トグル、URLコピーボタン、保存ボタンを提供します。
 */
export const PublishSettingsPanel = ({
  slug,
  isPublic,
  isSaving,
  onSlugChange,
  onIsPublicChange,
  onSave,
}: PublishSettingsPanelProps) => {
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/portfolio/${slug}`
      : `/portfolio/${slug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      // フォールバック: clipboard API非対応環境
    }
  };

  return (
    <div className="p-4 lg:p-6 border-t border-white/10 dark:border-white/5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* Slug入力 */}
        <div className="flex-1 w-full">
          <label
            htmlFor="slug-input"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            公開URL
          </label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">
              /portfolio/
            </span>
            <input
              id="slug-input"
              type="text"
              value={slug}
              onChange={(e) =>
                onSlugChange(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                )
              }
              placeholder="your-slug"
              className="flex-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* 公開トグル */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="public-toggle"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            公開
          </label>
          <button
            id="public-toggle"
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => onIsPublicChange(!isPublic)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
              isPublic ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                isPublic ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* URLコピーボタン */}
        {isPublic && slug && (
          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors duration-200 cursor-pointer whitespace-nowrap"
          >
            URLをコピー
          </button>
        )}

        {/* 保存ボタン */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all duration-300 cursor-pointer whitespace-nowrap"
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
};
