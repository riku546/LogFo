import { InvalidPasswordError, UserNotFoundError } from "../../domain/errors";
import type { User } from "../../domain/models/user";
import type { PasswordHasher } from "../interfaces/passwordHasher";
import type { UserRepository } from "../interfaces/userRepository";

/**
 * サインインユースケースの入力データ
 */
interface SigninInput {
  readonly email: string;
  readonly password: string;
}

/**
 * ユーザー認証のビジネスロジックを実行するユースケース
 * ユーザー検索 → パスワード検証 を行い、認証済みユーザー情報を返します。
 * JWT発行はプレゼンテーション層の責務として分離しています。
 *
 * @throws {UserNotFoundError} 指定メールのユーザーが存在しない場合
 * @throws {InvalidPasswordError} パスワードが一致しない場合
 */
export class SigninUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  /**
   * サインイン処理を実行します。
   *
   * @param input - サインインに必要な情報（メール、パスワード）
   * @returns 認証済みのユーザー情報
   * @throws {UserNotFoundError} ユーザーが見つからない場合
   * @throws {InvalidPasswordError} パスワードが不正な場合
   */
  async execute(input: SigninInput): Promise<User> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UserNotFoundError();
    }

    const isValidPassword = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new InvalidPasswordError();
    }

    return user;
  }
}
