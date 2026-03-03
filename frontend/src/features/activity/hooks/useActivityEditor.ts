"use client";

import { useCallback, useEffect, useState } from "react";

const DRAFT_KEY_PREFIX = "logfo_activity_draft_";

/**
 * Markdownエディタの状態管理（入力テキスト、プレビュー切り替え、localStorage下書き保存）
 *
 * Usage:
 * const { content, setContent, isPreview, togglePreview, clearDraft } = useActivityEditor(taskId);
 */
export const useActivityEditor = (taskId: string | null) => {
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const draftKey = taskId ? `${DRAFT_KEY_PREFIX}${taskId}` : null;

  // 下書き復元
  useEffect(() => {
    if (!draftKey) return;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setContent(savedDraft);
    }
  }, [draftKey]);

  // 自動下書き保存 (500ms debounce)
  useEffect(() => {
    if (!draftKey || content === "") return;
    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, content);
    }, 500);
    return () => clearTimeout(timer);
  }, [content, draftKey]);

  const togglePreview = useCallback(() => {
    setIsPreview((previous) => !previous);
  }, []);

  const clearDraft = useCallback(() => {
    setContent("");
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  return {
    content,
    setContent,
    isPreview,
    togglePreview,
    clearDraft,
  };
};
