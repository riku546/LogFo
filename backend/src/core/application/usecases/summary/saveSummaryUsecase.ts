import type {
  CreateSummaryInput,
  SummaryRepository,
} from "../../interfaces/summaryRepository";

/**
 * サマリーをDBに保存するユースケース
 */
export class SaveSummaryUsecase {
  constructor(private readonly summaryRepository: SummaryRepository) {}

  /**
   * サマリーを新規作成して保存します。
   *
   * @param input - サマリー作成データ
   * @returns 作成されたサマリーのID
   */
  async execute(input: CreateSummaryInput): Promise<string> {
    return this.summaryRepository.create(input);
  }
}
