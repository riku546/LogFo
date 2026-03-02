/**
 * パスワードのハッシュ化・検証を定義するインターフェース
 * 具体的なハッシュ実装（bcrypt等）はinfrastructure層で行います。
 */
export interface PasswordHasher {
  /**
   * パスワードをハッシュ化します。
   *
   * @param password - ハッシュ化する平文パスワード
   * @returns ハッシュ化されたパスワード文字列
   */
  hash(password: string): Promise<string>;

  /**
   * 平文パスワードとハッシュ値を比較検証します。
   *
   * @param password - 検証する平文パスワード
   * @param hashedPassword - 比較対象のハッシュ値
   * @returns パスワードが一致すればtrue
   */
  verify(password: string, hashedPassword: string): Promise<boolean>;
}
