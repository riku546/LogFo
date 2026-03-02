/**
 * ドメイン層のカスタムエラー基底クラス
 * すべてのドメイン固有エラーはこのクラスを継承します。
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * 既に使用されているメールアドレスで登録を試みた場合のエラー
 */
export class EmailAlreadyInUseError extends DomainError {
  constructor() {
    super("Email already in use");
  }
}

/**
 * 指定されたユーザーが存在しない場合のエラー
 */
export class UserNotFoundError extends DomainError {
  constructor() {
    super("User not found");
  }
}

/**
 * パスワードが一致しない場合のエラー
 */
export class InvalidPasswordError extends DomainError {
  constructor() {
    super("Password is incorrect");
  }
}
