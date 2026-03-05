import type { ActivityLog } from "../../../core/domain/models/activity";
import type { SummaryFormatType } from "../../../schema/summary";

/**
 * 活動記録データをLLMプロンプト用のテキストに整形します。
 *
 * @param activityLogs - 活動記録の配列
 * @returns 整形されたコンテキストテキスト
 */
const formatActivityLogs = (activityLogs: ActivityLog[]): string => {
  return activityLogs
    .map((log) => `[${log.loggedDate}] ${log.content}`)
    .join("\n");
};

/**
 * トークン制限対策: コンテキストが長すぎる場合にトリミングします。
 *
 * @param context - コンテキストテキスト
 * @param maxCharacters - 最大文字数（デフォルト: 30000文字）
 * @returns トリミングされたコンテキスト
 */
const trimContextIfNeeded = (
  context: string,
  maxCharacters = 30000,
): string => {
  if (context.length <= maxCharacters) return context;

  const trimmed = context.slice(0, maxCharacters);
  return `${trimmed}\n\n... (以降の活動記録は文字数制限によりトリミングされました)`;
};

/**
 * フォーマットに応じた出力スタイルの指示を返します。
 *
 * @param format - 出力フォーマット
 * @returns フォーマット指示テキスト
 */
const getFormatInstruction = (format: SummaryFormatType): string => {
  switch (format) {
    case "self_pr":
      return `# 出力フォーマット: 就活用の自己PR風
- フォーマルで説得力のある文体
- 「私は〇〇を通じて△△を学びました」という実績ベースの構成
- 課題発見 → 試行錯誤 → 解決 → 成長 という一貫したストーリー
- 具体的な技術名やツール名を必ず含め、裏付けのある自己PRにする
- 最終的に「だからこの経験を次の職場で活かせる」というメッセージで締めくくる`;

    case "monthly_report":
      return `# 出力フォーマット: エンジニア向けの月報・振り返りレポート風
- 箇条書きを活用した簡潔で分かりやすい構成
- 「やったこと」「学んだこと」「課題」「次のアクション」のセクション構成
- 技術的な詳細と定量的な情報（学習時間やコード量の推移など）を含む
- チームや上司に報告する前提で、客観的かつ実用的な内容にする`;

    case "casual_review":
      return `# 出力フォーマット: カジュアルな振り返り
- 親しみやすく自然な文体（ブログ記事のような雰囲気）
- 「こんなことがあった」「ここで悩んだけどこうやって解決した」など体験談調
- 技術的な内容も含めつつ、感情や気づきなどパーソナルな要素も織り交ぜる
- 将来の自分や同じ道を歩む人へのアドバイス・メッセージで締めくくる`;
  }
};

/**
 * サマリー生成用のシステムプロンプトを構築します。
 *
 * @param activityLogs - マイルストーンに紐づく活動記録の配列
 * @param format - 出力フォーマット
 * @returns LLMに渡すシステムプロンプト文字列
 */
export const buildSummarySystemPrompt = (
  activityLogs: ActivityLog[],
  format: SummaryFormatType,
): string => {
  const formattedLogs = formatActivityLogs(activityLogs);
  const trimmedLogs = trimContextIfNeeded(formattedLogs);
  const formatInstruction = getFormatInstruction(format);

  return `あなたはプロのキャリアカウンセラー兼テクニカルライターです。
ユーザーの日々の学習活動記録をもとに、これまでの軌跡を振り返り、成長のストーリーを紡ぐサマリーを作成してください。

# 指示
1. 以下の活動記録を分析し、ユーザーがどのような壁にぶつかり、どう解決し、どう成長したかを読み取ってください。
2. 単なる記録の羅列ではなく、一貫したストーリー性のある文章として構成してください。
3. 具体的な技術名、ツール名、学習内容を含め、説得力のあるサマリーにしてください。
4. 出力はMarkdown形式で、見出し（##）を使って構造化してください。

${formatInstruction}

# 活動記録データ
${trimmedLogs}

# 制約
- 出力は純粋なMarkdownテキストのみ
- コードブロック等で囲まないでください
- 活動記録に含まれない情報を捏造しないでください
- 日本語で出力してください`;
};
