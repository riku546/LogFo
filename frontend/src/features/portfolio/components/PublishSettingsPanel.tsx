"use client";

export interface PublishSettingsPanelProps {
  isSaving: boolean;
  onSave: () => void;
  onOpenPublishSettings: () => void;
}

/**
 * ポートフォリオのアクションバー
 * 保存ボタンと公開設定ボタンを配置します。
 */
export const PublishSettingsPanel = ({
  isSaving,
  onSave,
  onOpenPublishSettings,
}: PublishSettingsPanelProps) => {
  return (
    <div className="p-4 lg:p-6 border-t border-white/10 dark:border-white/5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
      <div className="flex items-center justify-end gap-3">
        {/* 公開設定ボタン */}
        <button
          type="button"
          onClick={onOpenPublishSettings}
          className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-all duration-300 cursor-pointer whitespace-nowrap"
        >
          公開設定
        </button>

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
