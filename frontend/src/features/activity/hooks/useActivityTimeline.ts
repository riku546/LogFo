"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ActivityLogItem } from "../api/activityApi";
import {
  createActivityLog,
  deleteActivityLog,
  fetchActivityLogs,
  updateActivityLog,
} from "../api/activityApi";

/**
 * タスクに紐づく活動記録一覧の取得と操作を管理するカスタムフック
 *
 * Usage:
 * const { activityLogs, isLoading, handleCreate, handleUpdate, handleDelete } = useActivityTimeline(taskId);
 */
export const useActivityTimeline = (taskId: string | null) => {
  const router = useRouter();
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = useCallback((): string | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("ログインが必要です");
      router.push("/signin");
    }
    return token;
  }, [router]);

  const loadActivityLogs = useCallback(async () => {
    if (!taskId) return;
    const token = getToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const logs = await fetchActivityLogs(token, taskId);
      setActivityLogs(logs);
    } catch (error) {
      console.error(error);
      toast.error("活動記録の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [taskId, getToken]);

  useEffect(() => {
    loadActivityLogs();
  }, [loadActivityLogs]);

  const handleCreate = useCallback(
    async (content: string, loggedDate: string) => {
      if (!taskId) return;
      const token = getToken();
      if (!token) return;

      try {
        await createActivityLog(token, { taskId, content, loggedDate });
        toast.success("活動記録を保存しました 🎉");
        await loadActivityLogs();
      } catch (error) {
        console.error(error);
        toast.error("活動記録の保存に失敗しました");
      }
    },
    [taskId, getToken, loadActivityLogs],
  );

  const handleUpdate = useCallback(
    async (activityId: string, content: string) => {
      const token = getToken();
      if (!token) return;

      try {
        await updateActivityLog(token, activityId, content);
        toast.success("活動記録を更新しました");
        await loadActivityLogs();
      } catch (error) {
        console.error(error);
        toast.error("活動記録の更新に失敗しました");
      }
    },
    [getToken, loadActivityLogs],
  );

  const handleDelete = useCallback(
    async (activityId: string) => {
      if (!confirm("この活動記録を削除しますか？")) return;
      const token = getToken();
      if (!token) return;

      try {
        await deleteActivityLog(token, activityId);
        toast.success("活動記録を削除しました");
        await loadActivityLogs();
      } catch (error) {
        console.error(error);
        toast.error("活動記録の削除に失敗しました");
      }
    },
    [getToken, loadActivityLogs],
  );

  return {
    activityLogs,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    reload: loadActivityLogs,
  };
};
