import { EmailAlreadyInUseError } from "../../../domain/errors";
import type { PasswordHasher } from "../../interfaces/passwordHasher";
import type { UserRepository } from "../../interfaces/userRepository";

/**
 * サインアップユースケースの入力データ
 */
interface SignupInput {
  readonly email: string;
  readonly password: string;
  readonly userName: string;
}

/**
 * 新規ユーザー登録のビジネスロジックを実行するユースケース
 * メール重複チェック → パスワードハッシュ化 → ユーザー作成 を行います。
 *
 * @throws {EmailAlreadyInUseError} 同一メールアドレスのユーザーが既に存在する場合
 */
export class SignupUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  /**
   * サインアップ処理を実行します。
   *
   * @param input - サインアップに必要な情報（メール、パスワード、ユーザー名）
   * @throws {EmailAlreadyInUseError} メールアドレスが既に使用されている場合
   */
  async execute(input: SignupInput): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new EmailAlreadyInUseError();
    }

    const hashedPassword = await this.passwordHasher.hash(input.password);

    await this.userRepository.create({
      name: input.userName,
      email: input.email,
      passwordHash: hashedPassword,
    });
  }
}
