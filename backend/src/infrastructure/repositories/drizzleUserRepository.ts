import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { UserRepository } from "../../core/application/interfaces/userRepository";
import type { CreateUserInput, User } from "../../core/domain/models/user";
import { users } from "../database/schema";

/**
 * Drizzle ORMを使用したUserRepositoryの具体実装
 * Cloudflare D1データベースに対してユーザーデータのCRUD操作を行います。
 */
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  /**
   * メールアドレスでユーザーを検索します。
   *
   * @param email - 検索対象のメールアドレス
   * @returns 見つかったユーザー、存在しない場合はundefined
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return results[0];
  }

  /**
   * 新規ユーザーをデータベースに作成します。
   *
   * @param input - ユーザー作成に必要なデータ（名前、メール、パスワードハッシュ）
   */
  async create(input: CreateUserInput): Promise<void> {
    await this.db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
      })
      .run();
  }
}
