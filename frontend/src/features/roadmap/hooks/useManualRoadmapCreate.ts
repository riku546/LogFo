"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  buildSaveRoadmapPayloadFromManualInput,
  saveRoadmap,
} from "../api/roadmapApi";

/**
 * 手入力作成画面で扱うタスク下書きデータ。
 */
export interface ManualRoadmapTaskDraft {
  clientId: string;
  title: string;
  estimatedHours: number | null;
}

/**
 * 手入力作成画面で扱うマイルストーン下書きデータ。
 */
export interface ManualRoadmapMilestoneDraft {
  clientId: string;
  title: string;
  description: string;
  tasks: ManualRoadmapTaskDraft[];
}

const createInitialTask = (): ManualRoadmapTaskDraft => ({
  clientId: crypto.randomUUID(),
  title: "",
  estimatedHours: null,
});

const createInitialMilestone = (): ManualRoadmapMilestoneDraft => ({
  clientId: crypto.randomUUID(),
  title: "",
  description: "",
  tasks: [createInitialTask()],
});

/**
 * 手入力ロードマップ作成画面の状態管理と保存処理を提供するカスタムフック。
 */
export const useManualRoadmapCreate = () => {
  const router = useRouter();
  const [currentState, setCurrentState] = useState("");
  const [goalState, setGoalState] = useState("");
  const [summary, setSummary] = useState("");
  const [milestones, setMilestones] = useState<ManualRoadmapMilestoneDraft[]>([
    createInitialMilestone(),
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const getToken = useCallback((): string | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("ログインが必要です");
      router.push("/signin");
      return null;
    }
    return token;
  }, [router]);

  const addMilestone = useCallback(() => {
    setMilestones((previousMilestones) => [
      ...previousMilestones,
      createInitialMilestone(),
    ]);
  }, []);

  const removeMilestone = useCallback((milestoneIndex: number) => {
    setMilestones((previousMilestones) =>
      previousMilestones.filter((_, index) => index !== milestoneIndex),
    );
  }, []);

  const updateMilestoneTitle = useCallback(
    (milestoneIndex: number, title: string) => {
      setMilestones((previousMilestones) =>
        previousMilestones.map((milestone, index) =>
          index === milestoneIndex ? { ...milestone, title } : milestone,
        ),
      );
    },
    [],
  );

  const updateMilestoneDescription = useCallback(
    (milestoneIndex: number, description: string) => {
      setMilestones((previousMilestones) =>
        previousMilestones.map((milestone, index) =>
          index === milestoneIndex ? { ...milestone, description } : milestone,
        ),
      );
    },
    [],
  );

  const addTask = useCallback((milestoneIndex: number) => {
    setMilestones((previousMilestones) =>
      previousMilestones.map((milestone, index) =>
        index === milestoneIndex
          ? { ...milestone, tasks: [...milestone.tasks, createInitialTask()] }
          : milestone,
      ),
    );
  }, []);

  const removeTask = useCallback(
    (milestoneIndex: number, taskIndex: number) => {
      setMilestones((previousMilestones) =>
        previousMilestones.map((milestone, currentMilestoneIndex) => {
          if (currentMilestoneIndex !== milestoneIndex) {
            return milestone;
          }

          return {
            ...milestone,
            tasks: milestone.tasks.filter((_, index) => index !== taskIndex),
          };
        }),
      );
    },
    [],
  );

  const updateTaskTitle = useCallback(
    (milestoneIndex: number, taskIndex: number, title: string) => {
      setMilestones((previousMilestones) =>
        previousMilestones.map((milestone, currentMilestoneIndex) => {
          if (currentMilestoneIndex !== milestoneIndex) {
            return milestone;
          }

          return {
            ...milestone,
            tasks: milestone.tasks.map((task, currentTaskIndex) =>
              currentTaskIndex === taskIndex ? { ...task, title } : task,
            ),
          };
        }),
      );
    },
    [],
  );

  const updateTaskEstimatedHours = useCallback(
    (
      milestoneIndex: number,
      taskIndex: number,
      estimatedHours: number | null,
    ) => {
      setMilestones((previousMilestones) =>
        previousMilestones.map((milestone, currentMilestoneIndex) => {
          if (currentMilestoneIndex !== milestoneIndex) {
            return milestone;
          }

          return {
            ...milestone,
            tasks: milestone.tasks.map((task, currentTaskIndex) =>
              currentTaskIndex === taskIndex
                ? { ...task, estimatedHours }
                : task,
            ),
          };
        }),
      );
    },
    [],
  );

  const validateBeforeSave = useCallback((): boolean => {
    if (!currentState.trim()) {
      toast.error("現在の状態を入力してください");
      return false;
    }
    if (!goalState.trim()) {
      toast.error("目標の状態を入力してください");
      return false;
    }
    if (milestones.length === 0) {
      toast.error("マイルストーンを1つ以上追加してください");
      return false;
    }

    const totalTaskCount = milestones.reduce(
      (taskCount, milestone) => taskCount + milestone.tasks.length,
      0,
    );
    if (totalTaskCount === 0) {
      toast.error("タスクを1つ以上追加してください");
      return false;
    }

    if (milestones.some((milestone) => !milestone.title.trim())) {
      toast.error("マイルストーン名を入力してください");
      return false;
    }
    if (
      milestones.some((milestone) =>
        milestone.tasks.some((task) => !task.title.trim()),
      )
    ) {
      toast.error("タスク名を入力してください");
      return false;
    }

    return true;
  }, [currentState, goalState, milestones]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    if (!validateBeforeSave()) return;

    const token = getToken();
    if (!token) return;

    setIsSaving(true);
    try {
      const payload = buildSaveRoadmapPayloadFromManualInput({
        currentState,
        goalState,
        summary,
        milestones,
      });
      const roadmapId = await saveRoadmap(token, payload);
      toast.success("ロードマップを保存しました");
      router.push(`/roadmap/${roadmapId}`);
    } catch (error) {
      console.error(error);
      toast.error("ロードマップの保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    validateBeforeSave,
    getToken,
    currentState,
    goalState,
    summary,
    milestones,
    router,
  ]);

  return {
    currentState,
    goalState,
    summary,
    milestones,
    isSaving,
    setCurrentState,
    setGoalState,
    setSummary,
    addMilestone,
    removeMilestone,
    updateMilestoneTitle,
    updateMilestoneDescription,
    addTask,
    removeTask,
    updateTaskTitle,
    updateTaskEstimatedHours,
    handleSave,
  };
};
