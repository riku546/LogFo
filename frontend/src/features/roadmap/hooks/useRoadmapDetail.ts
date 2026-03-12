"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { RoadmapDetail, RoadmapMilestone } from "../api/roadmapApi";
import {
  deleteRoadmap,
  fetchRoadmapDetail,
  updateRoadmap,
} from "../api/roadmapApi";

/**
 * ロードマップ詳細の取得・編集・削除を管理するカスタムフック
 *
 * Usage:
 * const { roadmap, isLoading, isEditing, editMilestones, ... } = useRoadmapDetail(roadmapId);
 */
export const useRoadmapDetail = (roadmapId: string) => {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<RoadmapDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMilestones, setEditMilestones] = useState<RoadmapMilestone[]>([]);

  // トークン取得ヘルパー
  const getToken = useCallback((): string | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("ログインが必要です");
      router.push("/signin");
    }
    return token;
  }, [router]);

  // ロードマップ取得
  const loadRoadmap = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const roadmapData = await fetchRoadmapDetail(token, roadmapId);
      setRoadmap(roadmapData);
    } catch (error) {
      console.error(error);
      toast.error("ロードマップの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, roadmapId]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  // 編集モード開始
  const startEditing = useCallback(() => {
    if (!roadmap) return;
    const milestones: RoadmapMilestone[] = structuredClone(roadmap.milestones);
    setEditMilestones(milestones);
    setIsEditing(true);
  }, [roadmap]);

  // 編集モードキャンセル
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditMilestones([]);
  }, []);

  // タスクのステータス変更
  const changeTaskStatus = useCallback(
    (
      milestoneIndex: number,
      taskIndex: number,
      status: "TODO" | "IN_PROGRESS" | "DONE",
    ) => {
      setEditMilestones((previous) => {
        const next = [...previous];
        const milestone = { ...next[milestoneIndex] };
        const tasks = [...milestone.tasks];
        tasks[taskIndex] = { ...tasks[taskIndex], status };
        milestone.tasks = tasks;

        // マイルストーンのステータスを自動更新
        const isAllDone = tasks.every((task) => task.status === "DONE");
        const hasAnyProgress = tasks.some(
          (task) => task.status === "IN_PROGRESS" || task.status === "DONE",
        );
        milestone.status = isAllDone
          ? "DONE"
          : hasAnyProgress
            ? "IN_PROGRESS"
            : "TODO";

        next[milestoneIndex] = milestone;
        return next;
      });
    },
    [],
  );

  // タスク追加
  const addTask = useCallback((milestoneIndex: number) => {
    setEditMilestones((previous) => {
      const next = [...previous];
      const milestone = { ...next[milestoneIndex] };
      milestone.tasks = [
        ...milestone.tasks,
        {
          title: "",
          estimatedHours: null,
          status: "TODO" as const,
          orderIndex: milestone.tasks.length,
        },
      ];
      next[milestoneIndex] = milestone;
      return next;
    });
  }, []);

  // タスクのタイトル変更
  const changeTaskTitle = useCallback(
    (milestoneIndex: number, taskIndex: number, title: string) => {
      setEditMilestones((previous) => {
        const next = [...previous];
        const milestone = { ...next[milestoneIndex] };
        const tasks = [...milestone.tasks];
        tasks[taskIndex] = { ...tasks[taskIndex], title };
        milestone.tasks = tasks;
        next[milestoneIndex] = milestone;
        return next;
      });
    },
    [],
  );

  // タスク削除
  const removeTask = useCallback(
    (milestoneIndex: number, taskIndex: number) => {
      setEditMilestones((previous) => {
        const next = [...previous];
        const milestone = { ...next[milestoneIndex] };
        milestone.tasks = milestone.tasks
          .filter((_, index) => index !== taskIndex)
          .map((task, index) => ({ ...task, orderIndex: index }));
        next[milestoneIndex] = milestone;
        return next;
      });
    },
    [],
  );

  // 保存
  const handleSave = useCallback(async () => {
    if (!roadmap) return;
    const token = getToken();
    if (!token) return;

    setIsSaving(true);
    try {
      await updateRoadmap(token, roadmapId, {
        currentState: roadmap.currentState,
        goalState: roadmap.goalState,
        pdfContext: roadmap.pdfContext,
        summary: roadmap.summary,
        milestones: editMilestones.map((milestone, milestoneIndex) => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          orderIndex: milestoneIndex,
          tasks: milestone.tasks.map((task, taskIndex) => ({
            id: task.id,
            title: task.title,
            estimatedHours: task.estimatedHours,
            status: task.status,
            orderIndex: taskIndex,
          })),
        })),
      });

      toast.success("ロードマップを更新しました");
      setIsEditing(false);
      loadRoadmap();
    } catch (error) {
      console.error(error);
      toast.error("更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }, [roadmap, getToken, roadmapId, editMilestones, loadRoadmap]);

  // 削除
  const handleDelete = useCallback(async () => {
    if (!confirm("本当にこのロードマップを削除しますか？")) return;

    const token = getToken();
    if (!token) return;

    try {
      await deleteRoadmap(token, roadmapId);
      toast.success("ロードマップを削除しました");
      router.push("/roadmap");
    } catch (error) {
      console.error(error);
      toast.error("削除に失敗しました");
    }
  }, [getToken, roadmapId, router]);

  // 進捗率計算
  const progress = (() => {
    const milestones = isEditing ? editMilestones : (roadmap?.milestones ?? []);
    const allTasks = milestones.flatMap((milestone) => milestone.tasks);
    if (allTasks.length === 0) return 0;
    const doneTasks = allTasks.filter((task) => task.status === "DONE").length;
    return Math.round((doneTasks / allTasks.length) * 100);
  })();

  const currentMilestones = isEditing
    ? editMilestones
    : (roadmap?.milestones ?? []);

  return {
    roadmap,
    isLoading,
    isSaving,
    isEditing,
    currentMilestones,
    progress,
    startEditing,
    cancelEditing,
    changeTaskStatus,
    addTask,
    changeTaskTitle,
    removeTask,
    handleSave,
    handleDelete,
  };
};
