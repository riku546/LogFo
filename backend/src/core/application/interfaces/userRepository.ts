import type { CreateUserInput, User } from "../../domain/models/user";

/**
 * ユーザーデータの永続化操作を定義するリポジトリインターフェース
 * 具体的なDB実装はinfrastructure層で行います。
 */
export interface UserRepository {
  /**
   * メールアドレスでユーザーを検索します。
   *
   * @param email - 検索対象のメールアドレス
   * @returns 見つかったユーザー、存在しない場合はundefined
   */
  findByEmail(email: string): Promise<User | undefined>;

  /**
   * 新規ユーザーを作成します。
   *
   * @param input - ユーザー作成に必要なデータ
   */
  create(input: CreateUserInput): Promise<void>;
}
