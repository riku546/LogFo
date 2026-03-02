/**
 * ユーザーエンティティの型定義
 * DBスキーマから独立した、ドメイン層のデータモデルです。
 */
export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly avatarUrl: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * ユーザー作成時に必要な入力データの型
 */
export interface CreateUserInput {
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
}
