"use client";

import { useEffect, useRef } from "react";

export interface PublishSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  isPublic: boolean;
  onSlugChange: (slug: string) => void;
  onIsPublicChange: (isPublic: boolean) => void;
}

/**
 * ポートフォリオ公開設定モーダル
 * 公開URL（Slug編集）と公開/非公開トグルを提供します。
 */
export const PublishSettingsModal = ({
  isOpen,
  onClose,
  slug,
  isPublic,
  onSlugChange,
  onIsPublicChange,
}: PublishSettingsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/portfolio/${slug}`
      : `/portfolio/${slug}`;

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      // フォールバック: clipboard API非対応環境
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm transition-opacity duration-300 cursor-default"
        onClick={onClose}
        aria-label="モーダルを閉じる"
      />

      {/* モーダル */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 p-6 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            公開設定
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors duration-200 cursor-pointer"
            aria-label="閉じる"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>閉じる</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 公開/非公開トグル */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              ポートフォリオを公開する
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isPublic ? "誰でもアクセスできます" : "自分だけが閲覧できます"}
            </p>
          </div>
          <button
            id="publish-modal-toggle"
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

        {/* 公開URL */}
        <div className="space-y-2">
          <label
            htmlFor="modal-slug-input"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            公開URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1 gap-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white/50 dark:border-white/15">
              <span className="text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">
                /portfolio/
              </span>
              <input
                id="modal-slug-input"
                type="text"
                value={slug}
                onChange={(e) =>
                  onSlugChange(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                placeholder="your-slug"
                className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyUrl}
              disabled={!slug}
              className="px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors duration-200 cursor-pointer whitespace-nowrap"
            >
              コピー
            </button>
          </div>
          {slug && (
            <p className="text-xs text-slate-400 dark:text-slate-500 break-all">
              {publicUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
