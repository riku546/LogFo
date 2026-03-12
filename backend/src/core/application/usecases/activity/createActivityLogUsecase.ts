import type {
  ActivityLogRepository,
  CreateActivityLogInput,
} from "../../interfaces/activityLogRepository";

/**
 * 活動記録の新規作成を実行するユースケース
 */
export class CreateActivityLogUsecase {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  /**
   * 活動記録を新規作成します。
   *
   * @param input - 活動記録作成に必要なデータ
   * @returns 作成された活動記録のID
   */
  async execute(input: CreateActivityLogInput): Promise<string> {
    return this.activityLogRepository.create(input);
  }
}
