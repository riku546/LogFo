import type { Summary } from "../../../core/domain/models/summary";
import type { PortfolioGeneratedSectionKey } from "../../../schema/portfolio";

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
 * @param targetSection - 生成対象のセクション
 * @returns システムプロンプト
 */
export const buildPortfolioNarrativeSystemPrompt = (
  targetSection: PortfolioGeneratedSectionKey,
): string => {
  return `あなたは就活・転職向けの文章作成に強いキャリアライターです。
ユーザーが選択したサマリー、自由入力テキスト、既存の生成文章を材料に、ポートフォリオ用の文章を作成してください。

# 方針
- 文体はフォーマルかつ具体的にする
- 生成する文章は200〜350字を目安にする
- 入力にない事実を捏造しない
- 技術名や取り組みを可能な限り明記する
- 出力は本文テキストのみとし、前置き・見出し・箇条書きを付けない

# 生成対象
今回は「${sectionLabelMap[targetSection]}」のみを生成してください。
`;
};

/**
 * AI文章生成用のユーザープロンプトを構築します。
 *
 * @param chatInput - 自由入力テキスト
 * @param targetSection - 生成対象セクション
 * @param selectedSummaries - 選択サマリー
 * @param currentContent - 既存生成内容
 * @returns ユーザープロンプト
 */
export const buildPortfolioNarrativeUserPrompt = ({
  chatInput,
  targetSection,
  selectedSummaries,
  currentContent,
}: {
  chatInput: string;
  targetSection: PortfolioGeneratedSectionKey;
  selectedSummaries: Summary[];
  currentContent: Record<PortfolioGeneratedSectionKey, string>;
}): string => {
  return `# 自由入力テキスト
${chatInput.trim() || "未入力"}

# 生成対象
${sectionLabelMap[targetSection]}

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
