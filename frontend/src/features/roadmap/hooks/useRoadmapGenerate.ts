"use client";

import type { GenerateRoadmapRequest } from "backend/src/schema/roadmap";
import type { RoadmapGeneration } from "backend/src/schema/roadmapGeneration";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { generateRoadmap, saveRoadmap } from "../api/roadmapApi";

/** エラーメッセージの抽出ヘルパー */
const getErrorMessage = (error: unknown, defaultMessage: string) =>
  error instanceof Error ? error.message : defaultMessage;

/** 生成リクエストボディの構築ヘルパー */
const buildGenerateRequest = (
  currentOccupation: string,
  currentSkills: string[],
  otherSkills: string,
  dailyStudyHours: number,
  targetCompanies: string,
  targetPosition: string,
  targetSkills: string,
  targetPeriodMonths: number,
): GenerateRoadmapRequest => ({
  currentOccupation,
  currentSkills,
  otherSkills: otherSkills || undefined,
  dailyStudyHours,
  targetCompanies: targetCompanies
    ? targetCompanies.split(",").map((company) => company.trim())
    : undefined,
  targetPosition,
  targetSkills: targetSkills || undefined,
  targetPeriodMonths,
});

/**
 * ロードマップ生成フォームの状態管理と生成・保存ロジックを管理するカスタムフック
 *
 * Usage:
 * const {
 *   formState, setFormState,
 *   generatedRoadmap, isGenerating, isSaving,
 *   handleGenerate, handleSave, resetResult,
 *   dropzone
 * } = useRoadmapGenerate();
 */
export const useRoadmapGenerate = () => {
  const router = useRouter();

  // フォーム入力状態
  const [currentOccupation, setCurrentOccupation] = useState("");
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [otherSkills, setOtherSkills] = useState("");
  const [dailyStudyHours, setDailyStudyHours] = useState(2);
  const [targetCompanies, setTargetCompanies] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [targetSkills, setTargetSkills] = useState("");
  const [targetPeriodMonths, setTargetPeriodMonths] = useState(6);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // 生成結果
  const [generatedRoadmap, setGeneratedRoadmap] =
    useState<RoadmapGeneration | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // トークン取得ヘルパー
  const getToken = useCallback((): string | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("ログインが必要です");
      router.push("/signin");
    }
    return token;
  }, [router]);

  // PDF Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setPdfFile(acceptedFiles[0]);
      toast.success("PDFをアップロードしました");
    }
  }, []);

  const dropzone = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: () => {
      toast.error("PDF(10MB以下)のみアップロード可能です");
    },
  });

  // スキル選択のトグル
  const toggleSkill = useCallback((skill: string) => {
    setCurrentSkills((previous) =>
      previous.includes(skill)
        ? previous.filter((existingSkill) => existingSkill !== skill)
        : [...previous, skill],
    );
  }, []);

  // ロードマップ生成
  const handleGenerate = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (currentSkills.length === 0) {
        toast.error("経験のあるスキルを1つ以上選択してください");
        return;
      }

      const token = getToken();
      if (!token) return;

      setIsGenerating(true);
      setGeneratedRoadmap(null);

      try {
        const requestBody = buildGenerateRequest(
          currentOccupation,
          currentSkills,
          otherSkills,
          dailyStudyHours,
          targetCompanies,
          targetPosition,
          targetSkills,
          targetPeriodMonths,
        );

        const response = await generateRoadmap(token, requestBody, pdfFile);
        const text = await response.text();
        const parsed = JSON.parse(text) as RoadmapGeneration;
        setGeneratedRoadmap(parsed);
        toast.success("ロードマップを生成しました！");
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error, "生成中にエラーが発生しました"));
      } finally {
        setIsGenerating(false);
      }
    },
    [
      currentOccupation,
      currentSkills,
      otherSkills,
      dailyStudyHours,
      targetCompanies,
      targetPosition,
      targetSkills,
      targetPeriodMonths,
      pdfFile,
      getToken,
    ],
  );

  // ロードマップ保存
  const handleSave = useCallback(async () => {
    if (!generatedRoadmap) return;

    const token = getToken();
    if (!token) return;

    setIsSaving(true);
    try {
      const roadmapId = await saveRoadmap(token, {
        currentState: `${currentOccupation} | スキル: ${currentSkills.join(", ")}`,
        goalState: `${targetPosition} | 目標: ${targetSkills || "なし"}`,
        pdfContext: null,
        summary: generatedRoadmap.summary,
        milestones: generatedRoadmap.milestones.map(
          (milestone, milestoneIndex) => ({
            title: milestone.title,
            description: milestone.description,
            orderIndex: milestoneIndex,
            tasks: milestone.tasks.map((task, taskIndex) => ({
              title: task.title,
              estimatedHours: task.estimatedHours,
              orderIndex: taskIndex,
            })),
          }),
        ),
      });

      toast.success("ロードマップを保存しました！");
      router.push(`/roadmap/${roadmapId}`);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "保存中にエラーが発生しました"));
    } finally {
      setIsSaving(false);
    }
  }, [
    generatedRoadmap,
    getToken,
    currentOccupation,
    currentSkills,
    targetPosition,
    targetSkills,
    router,
  ]);

  // 結果をリセット
  const resetResult = useCallback(() => {
    setGeneratedRoadmap(null);
  }, []);

  return {
    // フォーム状態
    currentOccupation,
    setCurrentOccupation,
    currentSkills,
    otherSkills,
    setOtherSkills,
    dailyStudyHours,
    setDailyStudyHours,
    targetCompanies,
    setTargetCompanies,
    targetPosition,
    setTargetPosition,
    targetSkills,
    setTargetSkills,
    targetPeriodMonths,
    setTargetPeriodMonths,
    pdfFile,
    // 生成結果
    generatedRoadmap,
    isGenerating,
    isSaving,
    // アクション
    toggleSkill,
    handleGenerate,
    handleSave,
    resetResult,
    // Dropzone
    dropzone,
  };
};
