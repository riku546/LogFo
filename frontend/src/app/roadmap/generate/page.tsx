"use client";

import Link from "next/link";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import { RoadmapResult } from "@/features/roadmap/components/RoadmapResult";
import { useRoadmapGenerate } from "@/features/roadmap/hooks/useRoadmapGenerate";

const SKILL_OPTIONS = [
  "HTML/CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "Rust",
  "SQL",
  "Docker",
  "AWS",
  "Git",
];

interface CurrentStateSectionProps {
  currentOccupation: string;
  setCurrentOccupation: (value: string) => void;
  currentSkills: string[];
  toggleSkill: (skill: string) => void;
  otherSkills: string;
  setOtherSkills: (value: string) => void;
  dailyStudyHours: number;
  setDailyStudyHours: (value: number) => void;
}

const CurrentStateSection = ({
  currentOccupation,
  setCurrentOccupation,
  currentSkills,
  toggleSkill,
  otherSkills,
  setOtherSkills,
  dailyStudyHours,
  setDailyStudyHours,
}: CurrentStateSectionProps) => (
  <section className="glass rounded-2xl p-6">
    <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-slate-100">
      あなたの現在の状態
    </h2>
    <div className="space-y-4">
      <div>
        <label
          htmlFor="currentOccupation"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          現在の職種・立場 *
        </label>
        <input
          id="currentOccupation"
          type="text"
          value={currentOccupation}
          onChange={(event) => setCurrentOccupation(event.target.value)}
          placeholder="例: 大学3年生（情報工学科）"
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          経験のあるスキル（タップで選択）*
        </span>
        <fieldset className="flex flex-wrap gap-2" aria-label="スキル選択">
          <legend className="sr-only">スキル選択</legend>
          {SKILL_OPTIONS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                currentSkills.includes(skill)
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
              aria-pressed={currentSkills.includes(skill)}
            >
              {skill}
            </button>
          ))}
        </fieldset>
      </div>

      <div>
        <label
          htmlFor="otherSkills"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          その他のスキル・資格
        </label>
        <input
          id="otherSkills"
          type="text"
          value={otherSkills}
          onChange={(event) => setOtherSkills(event.target.value)}
          placeholder="例: TOEIC 800点、基本情報技術者"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      <div>
        <label
          htmlFor="dailyStudyHours"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          1日の学習可能時間: {dailyStudyHours}時間
        </label>
        <input
          id="dailyStudyHours"
          type="range"
          min="0.5"
          max="12"
          step="0.5"
          value={dailyStudyHours}
          onChange={(event) => setDailyStudyHours(Number(event.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>0.5h</span>
          <span>12h</span>
        </div>
      </div>
    </div>
  </section>
);

interface TargetSectionProps {
  targetPosition: string;
  setTargetPosition: (value: string) => void;
  targetCompanies: string;
  setTargetCompanies: (value: string) => void;
  targetSkills: string;
  setTargetSkills: (value: string) => void;
  targetPeriodMonths: number;
  setTargetPeriodMonths: (value: number) => void;
}

const TargetSection = ({
  targetPosition,
  setTargetPosition,
  targetCompanies,
  setTargetCompanies,
  targetSkills,
  setTargetSkills,
  targetPeriodMonths,
  setTargetPeriodMonths,
}: TargetSectionProps) => (
  <section className="glass rounded-2xl p-6">
    <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-slate-100">
      あなたの目標
    </h2>
    <div className="space-y-4">
      <div>
        <label
          htmlFor="targetPosition"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          目指す職種・ポジション *
        </label>
        <input
          id="targetPosition"
          type="text"
          value={targetPosition}
          onChange={(event) => setTargetPosition(event.target.value)}
          placeholder="例: Webフロントエンドエンジニア"
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      <div>
        <label
          htmlFor="targetCompanies"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          志望企業（カンマ区切り）
        </label>
        <input
          id="targetCompanies"
          type="text"
          value={targetCompanies}
          onChange={(event) => setTargetCompanies(event.target.value)}
          placeholder="例: Google, メルカリ, LINE"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      <div>
        <label
          htmlFor="targetSkills"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          習得したい技術・資格
        </label>
        <input
          id="targetSkills"
          type="text"
          value={targetSkills}
          onChange={(event) => setTargetSkills(event.target.value)}
          placeholder="例: Next.js, GraphQL, AWS認定ソリューションアーキテクト"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      <div>
        <label
          htmlFor="targetPeriodMonths"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          目標達成期間: {targetPeriodMonths}ヶ月
        </label>
        <input
          id="targetPeriodMonths"
          type="range"
          min="1"
          max="24"
          step="1"
          value={targetPeriodMonths}
          onChange={(event) =>
            setTargetPeriodMonths(Number(event.target.value))
          }
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>1ヶ月</span>
          <span>24ヶ月</span>
        </div>
      </div>
    </div>
  </section>
);

interface PdfUploadSectionProps {
  userRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  userInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isUserDragActive: boolean;
  userPdfFile: File | null;
  companyRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  companyInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isCompanyDragActive: boolean;
  companyPdfFile: File | null;
}

const PdfUploadSection = ({
  userRootProps,
  userInputProps,
  isUserDragActive,
  userPdfFile,
  companyRootProps,
  companyInputProps,
  isCompanyDragActive,
  companyPdfFile,
}: PdfUploadSectionProps) => (
  <section className="glass rounded-2xl p-6">
    <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-slate-100">
      参考資料（任意）
    </h2>
    <div className="grid gap-4 md:grid-cols-2">
      {/* 自分の資料 */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          📄 自分の資料
        </p>
        <div
          {...userRootProps()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isUserDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : userPdfFile
                ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                : "border-slate-300 hover:border-blue-400 dark:border-slate-700 dark:hover:border-blue-600"
          }`}
        >
          <input {...userInputProps()} />
          {userPdfFile ? (
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                📄 {userPdfFile.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                クリックまたはドラッグで差し替え可能
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                履歴書や職務経歴書のPDFをドラッグ＆ドロップ
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                またはクリックして選択（10MB以下）
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 企業の資料 */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          🏢 企業の資料
        </p>
        <div
          {...companyRootProps()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isCompanyDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : companyPdfFile
                ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                : "border-slate-300 hover:border-blue-400 dark:border-slate-700 dark:hover:border-blue-600"
          }`}
        >
          <input {...companyInputProps()} />
          {companyPdfFile ? (
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                🏢 {companyPdfFile.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                クリックまたはドラッグで差し替え可能
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                会社説明資料や採用情報PDFをドラッグ＆ドロップ
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                またはクリックして選択（10MB以下）
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

export default function RoadmapGeneratePage() {
  const {
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
    generatedRoadmap,
    isGenerating,
    isSaving,
    toggleSkill,
    handleGenerate,
    handleSave,
    resetResult,
    userDropzone,
    companyDropzone,
  } = useRoadmapGenerate();

  const {
    getRootProps: getUserRootProps,
    getInputProps: getUserInputProps,
    isDragActive: isUserDragActive,
  } = userDropzone;

  const {
    getRootProps: getCompanyRootProps,
    getInputProps: getCompanyInputProps,
    isDragActive: isCompanyDragActive,
  } = companyDropzone;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <Link
            href="/roadmap"
            className="cursor-pointer text-sm font-medium text-blue-600 transition-colors duration-300 hover:text-blue-700"
          >
            ← ロードマップ一覧に戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            学習ロードマップ生成
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            あなたのスキルと目標を入力すると、AIが最適な学習計画を作成します
          </p>
        </div>

        {/* 生成済み（または生成中）のロードマップがあれば表示 */}
        {generatedRoadmap ? (
          <RoadmapResult
            isGenerating={isGenerating}
            generatedRoadmap={generatedRoadmap}
            isSaving={isSaving}
            onSave={handleSave}
            onReset={resetResult}
          />
        ) : (
          /* 入力フォーム */
          <form onSubmit={handleGenerate} className="space-y-8">
            <CurrentStateSection
              currentOccupation={currentOccupation}
              setCurrentOccupation={setCurrentOccupation}
              currentSkills={currentSkills}
              toggleSkill={toggleSkill}
              otherSkills={otherSkills}
              setOtherSkills={setOtherSkills}
              dailyStudyHours={dailyStudyHours}
              setDailyStudyHours={setDailyStudyHours}
            />

            <TargetSection
              targetPosition={targetPosition}
              setTargetPosition={setTargetPosition}
              targetCompanies={targetCompanies}
              setTargetCompanies={setTargetCompanies}
              targetSkills={targetSkills}
              setTargetSkills={setTargetSkills}
              targetPeriodMonths={targetPeriodMonths}
              setTargetPeriodMonths={setTargetPeriodMonths}
            />

            <PdfUploadSection
              userRootProps={getUserRootProps}
              userInputProps={getUserInputProps}
              isUserDragActive={isUserDragActive}
              userPdfFile={userPdfFile}
              companyRootProps={getCompanyRootProps}
              companyInputProps={getCompanyInputProps}
              isCompanyDragActive={isCompanyDragActive}
              companyPdfFile={companyPdfFile}
            />

            {/* 生成ボタン */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full cursor-pointer rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <title>生成中</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  ロードマップを生成中...
                </span>
              ) : (
                "ロードマップを生成する"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
