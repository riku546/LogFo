"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  type SaveSummaryPayload,
  type SummaryFormat,
  saveSummary,
  summaryGenerateFetch,
} from "../api/summaryApi";

/**
 * サマリー生成の状態管理を行うカスタムフック
 *
 * Usage:
 * const { streamedText, isGenerating, handleGenerate, ... } = useSummaryGenerate();
 */
export const useSummaryGenerate = () => {
  const router = useRouter();

  // 生成設定
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [selectedFormat, setSelectedFormat] =
    useState<SummaryFormat>("self_pr");

  // 生成状態
  const [streamedText, setStreamedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // 保存状態
  const [summaryTitle, setSummaryTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /**
   * ストリームを読み取って状態を更新する内部関数
   */
  const readStream = useCallback(
    async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedText(accumulated);
      }
      return accumulated;
    },
    [],
  );

  /**
   * 生成エラーの共通ハンドリング
   */
  const handleGenerateError = useCallback((error: unknown) => {
    console.error(error);
    if (
      error instanceof Error &&
      "statusCode" in error &&
      (error as { statusCode: number }).statusCode === 404
    ) {
      toast.error(
        "選択したマイルストーンに活動記録がありません。先に活動を記録してください。",
      );
    } else {
      toast.error("サマリーの生成に失敗しました");
    }
  }, []);

  /**
   * サマリーをストリーミング生成する
   */
  const handleGenerate = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("ログインが必要です");
      router.push("/signin");
      return;
    }

    if (!selectedMilestoneId) {
      toast.error("マイルストーンを選択してください");
      return;
    }

    setIsGenerating(true);
    setStreamedText("");
    setIsGenerated(false);

    try {
      const response = await summaryGenerateFetch("", undefined, {
        token,
        milestoneId: selectedMilestoneId,
        format: selectedFormat,
      });

      if (!response.body) {
        throw new Error("レスポンスボディが空です");
      }

      const reader = response.body.getReader();
      const content = await readStream(reader);

      setEditedContent(content);
      setIsGenerated(true);
      toast.success("サマリーの生成が完了しました");
    } catch (error) {
      handleGenerateError(error);
    } finally {
      setIsGenerating(false);
    }
  }, [
    selectedMilestoneId,
    selectedFormat,
    router,
    readStream,
    handleGenerateError,
  ]);

  /**
   * 生成されたサマリーを保存する
   */
  const handleSave = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("ログインが必要です");
      router.push("/signin");
      return;
    }

    if (!summaryTitle.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    if (!editedContent.trim()) {
      toast.error("サマリー内容がありません");
      return;
    }

    setIsSaving(true);

    try {
      const payload: SaveSummaryPayload = {
        milestoneId: selectedMilestoneId,
        title: summaryTitle,
        content: editedContent,
      };

      await saveSummary(token, payload);
      toast.success("サマリーを保存しました");

      // 状態をリセット
      setStreamedText("");
      setIsGenerated(false);
      setSummaryTitle("");
      setEditedContent("");
    } catch (error) {
      console.error(error);
      toast.error("サマリーの保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }, [selectedMilestoneId, summaryTitle, editedContent, router]);

  /**
   * 生成結果をリセットする
   */
  const handleReset = useCallback(() => {
    setStreamedText("");
    setIsGenerated(false);
    setSummaryTitle("");
    setEditedContent("");
  }, []);

  return {
    // 設定
    selectedMilestoneId,
    setSelectedMilestoneId,
    selectedFormat,
    setSelectedFormat,

    // 生成状態
    streamedText,
    isGenerating,
    isGenerated,

    // 保存状態
    summaryTitle,
    setSummaryTitle,
    editedContent,
    setEditedContent,
    isSaving,

    // アクション
    handleGenerate,
    handleSave,
    handleReset,
  };
};
