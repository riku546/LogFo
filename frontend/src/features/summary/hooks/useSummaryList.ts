"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SummaryItem } from "@/types/summary";
import { deleteSummary, fetchSummariesByMilestone } from "../api/summaryApi";

/**
 * マイルストーン別サマリー一覧の取得・削除を管理するカスタムフック
 *
 * Usage:
 * const { summaryList, isLoading, handleDelete } = useSummaryList(milestoneId);
 */
export const useSummaryList = (milestoneId: string) => {
  const router = useRouter();
  const [summaryList, setSummaryList] = useState<SummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSummaries = useCallback(async () => {
    if (!milestoneId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("ログインが必要です");
      router.push("/signin");
      return;
    }

    setIsLoading(true);
    try {
      const summaries = await fetchSummariesByMilestone(token, milestoneId);
      setSummaryList(summaries);
    } catch (error) {
      console.error(error);
      toast.error("サマリーの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [milestoneId, router]);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  /**
   * サマリーを削除する
   */
  const handleDelete = useCallback(
    async (summaryId: string) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("ログインが必要です");
        router.push("/signin");
        return;
      }

      try {
        await deleteSummary(token, summaryId);
        setSummaryList((prev) => prev.filter((s) => s.id !== summaryId));
        toast.success("サマリーを削除しました");
      } catch (error) {
        console.error(error);
        toast.error("サマリーの削除に失敗しました");
      }
    },
    [router],
  );

  return {
    summaryList,
    isLoading,
    handleDelete,
    refetch: loadSummaries,
  };
};
