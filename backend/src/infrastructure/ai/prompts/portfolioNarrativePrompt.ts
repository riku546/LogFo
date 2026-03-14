import type { Summary } from "../../../core/domain/models/summary";
import type {
  PortfolioGeneratedSectionKey,
  ProfileSettings,
} from "../../../schema/portfolio";

const sectionLabelMap: Record<PortfolioGeneratedSectionKey, string> = {
  selfPr: "自己PR",
  strengths: "強み",
  learnings: "学び",
  futureVision: "将来",
};

/**
 * サマリー一覧をプロンプト入力向け文字列へ整形します。
 *
 * @param summaries - ユーザーが選択したサマリー一覧
 * @returns 連結済みのサマリー文字列
 */
const formatSelectedSummaries = (summaries: Summary[]): string => {
  if (summaries.length === 0) return "選択サマリーなし";

  return summaries
    .map((summary, index) => {
      const title = summary.title?.trim() || `サマリー${index + 1}`;
      return `### ${title}\n${summary.content}`;
    })
    .join("\n\n");
};

/**
 * AI文章生成用のシステムプロンプトを構築します。
 *
 * @param targetSection - 項目別再生成対象。未指定なら全項目生成
 * @returns システムプロンプト
 */
export const buildPortfolioNarrativeSystemPrompt = (
  targetSection?: PortfolioGeneratedSectionKey,
): string => {
  const targetInstruction = targetSection
    ? `今回は「${sectionLabelMap[targetSection]}」のみを更新してください。ほかの項目は currentContent を維持してください。`
    : "4項目すべてを生成してください。";

  return `あなたは就活・転職向けの文章作成に強いキャリアライターです。
ユーザーのプロフィール、選択サマリー、自己PR下書きを材料に、ポートフォリオ用の文章を作成してください。

# 方針
- 文体はフォーマルかつ具体的にする
- 各項目は200〜350字を目安にする
- 入力にない事実を捏造しない
- 技術名や取り組みを可能な限り明記する
- 出力は指定スキーマに厳密に従う

# 生成対象
${targetInstruction}
`;
};

/**
 * AI文章生成用のユーザープロンプトを構築します。
 *
 * @param profile - プロフィール情報
 * @param selfPrDraft - 自己PR下書き
 * @param selectedSummaries - 選択サマリー
 * @param currentContent - 既存生成内容
 * @returns ユーザープロンプト
 */
export const buildPortfolioNarrativeUserPrompt = ({
  profile,
  selfPrDraft,
  selectedSummaries,
  currentContent,
}: {
  profile: ProfileSettings;
  selfPrDraft: string;
  selectedSummaries: Summary[];
  currentContent: Record<PortfolioGeneratedSectionKey, string>;
}): string => {
  const formattedCareerStories = (profile.careerStories ?? [])
    .map((careerStory) => {
      const period =
        careerStory.periodFrom || careerStory.periodTo
          ? `${careerStory.periodFrom || ""} - ${careerStory.periodTo || (careerStory.isCurrent ? "現在" : "")}`
          : "期間未設定";
      return `- ${careerStory.title || "役割未設定"} / ${careerStory.organization || "所属未設定"} / ${period}\n  ${careerStory.story || "説明なし"}`;
    })
    .join("\n");

  const formattedSkills =
    profile.skills && profile.skills.length > 0
      ? profile.skills.join(", ")
      : "スキル未設定";

  return `# プロフィール
表示名: ${profile.displayName}
自己紹介:
${profile.bio || "自己紹介未入力"}

経歴:
${formattedCareerStories || "経歴未設定"}

スキル:
${formattedSkills}

# 自己PR下書き
${selfPrDraft.trim() || "下書きなし"}

# 選択サマリー
${formatSelectedSummaries(selectedSummaries)}

# currentContent
selfPr:
${currentContent.selfPr || ""}

strengths:
${currentContent.strengths || ""}

learnings:
${currentContent.learnings || ""}

futureVision:
${currentContent.futureVision || ""}
`;
};
