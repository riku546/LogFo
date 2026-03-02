import type { GenerateRoadmapRequest } from "../../../schema/roadmap";

/**
 * ロードマップ生成用のシステムプロンプトを構築します。
 *
 * @param input - ユーザーが入力したスキル・目標情報
 * @param userPdfText - ユーザーの履歴書・経歴PDFから抽出したテキスト（任意）
 * @param companyPdfText - 志望企業の資料PDFから抽出したテキスト（任意）
 * @returns LLMに渡すシステムプロンプト文字列
 */
export const buildRoadmapSystemPrompt = (
  input: GenerateRoadmapRequest,
  userPdfText?: string,
  companyPdfText?: string,
): string => {
  const contextSections: string[] = [];

  // ユーザーの現状
  contextSections.push(`## ユーザーの現状
- 現在の職種/立場: ${input.currentOccupation}
- 経験のあるスキル: ${input.currentSkills.join(", ")}
- その他のスキル・資格: ${input.otherSkills || "なし"}
- 1日の学習可能時間: ${input.dailyStudyHours}時間`);

  // ユーザーの目標
  const targetCompanies =
    input.targetCompanies && input.targetCompanies.length > 0
      ? input.targetCompanies.join(", ")
      : "特になし";

  contextSections.push(`## ユーザーの目標
- 志望企業: ${targetCompanies}
- 目指す職種/ポジション: ${input.targetPosition}
- 習得したい技術・資格: ${input.targetSkills || "特になし"}
- 目標達成までの希望期間: ${input.targetPeriodMonths}ヶ月`);

  // ユーザーの履歴書・経歴PDFコンテキスト（存在する場合）
  if (userPdfText) {
    contextSections.push(`## ユーザーの履歴書・経歴から抽出した情報
以下はユーザーがアップロードした履歴書や職務経歴書から抽出したテキストです。ユーザーの現在のスキルや経験を把握する参考にしてください。

${userPdfText}`);
  }

  // 企業資料PDFコンテキスト（存在する場合）
  if (companyPdfText) {
    contextSections.push(`## 志望企業の資料から抽出した情報
以下はユーザーがアップロードした志望企業の会社説明資料や採用情報から抽出したテキストです。企業が求めるスキルや人物像を把握する参考にしてください。

${companyPdfText}`);
  }

  return `あなたはプロのキャリアメンター兼シニアエンジニアです。
ユーザーの現在のスキルセットと目標を分析し、目標達成までの具体的な学習ロードマップを作成してください。

# 指示
1. まず、ユーザーの現状と目標のギャップを分析し、summaryとして簡潔に説明してください。
2. ギャップを埋めるためのマイルストーン（中間目標）を3〜7個程度に分けて提案してください。
3. 各マイルストーンには3〜8個程度の具体的なタスク（TODOレベルのアクション）を含めてください。
4. 各タスクには予想学習時間（時間単位）を見積もってください。
5. ユーザーの1日の学習可能時間（${input.dailyStudyHours}時間）を考慮し、希望期間（${input.targetPeriodMonths}ヶ月）内に達成可能な現実的な計画を立ててください。
6. 抽象的な指示ではなく、「○○の公式チュートリアルを完了する」「△△を使ったToDoアプリを作成する」のように、具体的なアクションとして書いてください。

# 制約
- 出力は提供されたJSONスキーマに厳密に従って、純粋なJSONオブジェクトのみを返してください。
- 最初の文字は必ず "{" から始め、最後の文字は "}" で終わるようにしてください。
- Markdownのコードブロック（\`\`\`json など）や、その他の説明文・解説を一切含めないでください。
- 目標が不明確な場合は、目標を探索・明確化するためのタスクを提案してください。
- タスクの順序は依存関係を考慮し、前提知識が必要なものが先に来るようにしてください。

${contextSections.join("\n\n")}`;
};

/**
 * Web検索を利用した企業情報取得用のプロンプトを構築します。
 *
 * @param companyNames - 志望企業名の配列
 * @returns 企業情報検索用のプロンプト文字列
 */
export const buildCompanySearchPrompt = (companyNames: string[]): string => {
  return `以下の企業について、エンジニア採用で求められる技術スタックと求める人物像を調べてまとめてください。
各企業について、主要な技術スタック（プログラミング言語、フレームワーク等）と、求めるスキル・経験を箇条書きでまとめてください。

対象企業: ${companyNames.join(", ")}`;
};
