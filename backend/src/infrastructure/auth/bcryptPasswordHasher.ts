import bcrypt from "bcryptjs";
import type { PasswordHasher } from "../../core/application/interfaces/passwordHasher";

const SALT_ROUNDS = 10;

/**
 * bcryptjsを使用したPasswordHasherの具体実装
 * パスワードのハッシュ化と検証をbcryptアルゴリズムで行います。
 */
export class BcryptPasswordHasher implements PasswordHasher {
  /**
   * パスワードをbcryptでハッシュ化します。
   *
   * @param password - ハッシュ化する平文パスワード
   * @returns ハッシュ化されたパスワード文字列
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * 平文パスワードとbcryptハッシュ値を比較検証します。
   *
   * @param password - 検証する平文パスワード
   * @param hashedPassword - 比較対象のbcryptハッシュ値
   * @returns パスワードが一致すればtrue
   */
  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
