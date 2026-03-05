import type { Summary } from "../../domain/models/summary";

/**
 * サマリー作成時の入力データ
 */
export interface CreateSummaryInput {
  readonly userId: string;
  readonly milestoneId: string;
  readonly title: string;
  readonly content: string;
}

/**
 * サマリーデータの永続化操作を定義するリポジトリインターフェース
 */
export interface SummaryRepository {
  /**
   * サマリーを新規作成します。
   *
   * @param input - サマリー作成に必要なデータ
   * @returns 作成されたサマリーのID
   */
  create(input: CreateSummaryInput): Promise<string>;

  /**
   * マイルストーンIDに紐づくサマリーを作成日時降順で取得します。
   *
   * @param milestoneId - マイルストーンのID
   * @returns サマリーの配列
   */
  findByMilestoneId(milestoneId: string): Promise<Summary[]>;

  /**
   * IDでサマリーを1件取得します。
   *
   * @param summaryId - サマリーのID
   * @returns サマリーデータ、存在しない場合はundefined
   */
  findById(summaryId: string): Promise<Summary | undefined>;

  /**
   * サマリーのタイトルと内容を更新します。
   *
   * @param summaryId - 更新するサマリーのID
   * @param title - 更新後のタイトル
   * @param content - 更新後のMarkdownテキスト
   */
  update(summaryId: string, title: string, content: string): Promise<void>;

  /**
   * サマリーを削除します。
   *
   * @param summaryId - 削除するサマリーのID
   */
  delete(summaryId: string): Promise<void>;

  /**
   * サマリーの所有者を確認します。
   *
   * @param summaryId - サマリーのID
   * @param userId - ユーザーID
   * @returns ユーザーがオーナーの場合true
   */
  isOwner(summaryId: string, userId: string): Promise<boolean>;
}
