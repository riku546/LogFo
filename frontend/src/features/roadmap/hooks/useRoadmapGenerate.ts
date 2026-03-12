import { experimental_useObject as useObject } from "@ai-sdk/react";
import type { GenerateRoadmapRequest } from "backend/src/schema/roadmap";
import { roadmapGenerationSchema } from "backend/src/schema/roadmapGeneration";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { roadmapGenerateFetch, saveRoadmap } from "../api/roadmapApi";

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
 * ロードマップ生成フォームの状態管理と生成（ストリーミング）・保存ロジックを管理するカスタムフック
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
  const [userPdfFile, setUserPdfFile] = useState<File | null>(null);
  const [companyPdfFile, setCompanyPdfFile] = useState<File | null>(null);

  // 保存中ステータス
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

  // Vercel AI SDK useObject
  const {
    submit,
    object: generatedRoadmap,
    stop,
    isLoading,
  } = useObject({
    api: "/api/roadmap/generate", // 実際の送信先は fetch 関数内で上書き・構築される
    schema: roadmapGenerationSchema,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = getToken();
      if (!token) throw new Error("Unauthorized");

      // requestパラメータからリクエストデータをパースするワークアラウンド
      // （useObjectのsubmitに渡した引数は本文JSONとしてinit.bodyに入るため）
      if (typeof init?.body !== "string") {
        throw new Error("Invalid request body");
      }
      const requestData = JSON.parse(init.body);

      return roadmapGenerateFetch(input, init, {
        token,
        requestData,
        userPdfFile,
        companyPdfFile,
      });
    },
    onFinish: () => {
      toast.success("ロードマップを生成しました！");
    },
    onError: (error: Error) => {
      console.error(error);
      toast.error(getErrorMessage(error, "生成中にエラーが発生しました"));
    },
  });

  // ユーザーPDF Dropzone
  const onUserPdfDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setUserPdfFile(acceptedFiles[0]);
      toast.success("自分の資料をアップロードしました");
    }
  }, []);

  const userDropzone = useDropzone({
    onDrop: onUserPdfDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: () => {
      toast.error("PDF(10MB以下)のみアップロード可能です");
    },
  });

  // 企業PDF Dropzone
  const onCompanyPdfDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setCompanyPdfFile(acceptedFiles[0]);
      toast.success("企業の資料をアップロードしました");
    }
  }, []);

  const companyDropzone = useDropzone({
    onDrop: onCompanyPdfDrop,
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

  // ロードマップ生成ハンドラ
  const handleGenerate = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      if (currentSkills.length === 0) {
        toast.error("経験のあるスキルを1つ以上選択してください");
        return;
      }

      if (!getToken()) return;

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

      // useObject の submit にリクエストデータを渡す
      submit(requestBody);
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
      submit,
      getToken,
    ],
  );

  // ロードマップ保存
  const handleSave = useCallback(async () => {
    // 生成完了の確認（ストリーミング中は保存できないようにする）
    if (!generatedRoadmap || isLoading) {
      toast.error("ロードマップの生成が完了していません");
      return;
    }

    // 型ガード的に必須プロパティをチェック
    if (!(generatedRoadmap.summary && generatedRoadmap.milestones)) return;

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
            title: milestone?.title || "",
            description: milestone?.description || "",
            orderIndex: milestoneIndex,
            tasks: (milestone?.tasks || []).map((task, taskIndex) => ({
              title: task?.title || "",
              estimatedHours: task?.estimatedHours || 0,
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
    isLoading,
    getToken,
    currentOccupation,
    currentSkills,
    targetPosition,
    targetSkills,
    router,
  ]);

  // FIXME: useObjectには生成結果をクリアする純正機能がないためダミー
  // 必要に応じて formState のリセットなどで代替する
  const resetResult = useCallback(() => {
    // 現状は画面リロードなどで対応するか、再生成を促す
    window.location.reload();
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
    userPdfFile,
    companyPdfFile,
    // 生成結果と状態
    generatedRoadmap,
    isGenerating: isLoading,
    isSaving,
    // アクション
    toggleSkill,
    handleGenerate,
    handleSave,
    resetResult,
    stopGeneration: stop,
    // Dropzone
    userDropzone,
    companyDropzone,
  };
};
