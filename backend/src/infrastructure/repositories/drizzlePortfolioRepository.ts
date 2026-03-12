import { and, eq, ne } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type {
  PortfolioRepository,
  UpsertPortfolioInput,
} from "../../core/application/interfaces/portfolioRepository";
import type { Portfolio } from "../../core/domain/models/portfolio";
import { portfolioSettingsSchema } from "../../schema/portfolio";
import { portfolios } from "../database/schema";

/**
 * Drizzle ORMを使用したPortfolioRepositoryの具体実装
 * portfolios テーブルに対するCRUD操作を行います。
 */
export class DrizzlePortfolioRepository implements PortfolioRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  private toPortfolio(row: typeof portfolios.$inferSelect): Portfolio {
    const parsedSettings = portfolioSettingsSchema.safeParse(row.settings);
    return {
      id: row.id,
      userId: row.userId,
      slug: row.slug,
      isPublic: row.isPublic,
      settings: parsedSettings.success ? parsedSettings.data : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * ポートフォリオをUPSERTします。
   * ユーザーIDで既存レコードを検索し、あれば更新、なければ新規作成します。
   *
   * @param input - ポートフォリオ作成・更新データ
   * @returns 作成または更新されたポートフォリオのID
   */
  async upsert(input: UpsertPortfolioInput): Promise<string> {
    const existing = await this.findByUserId(input.userId);

    if (existing) {
      await this.db
        .update(portfolios)
        .set({
          slug: input.slug,
          isPublic: input.isPublic,
          settings: input.settings,
          updatedAt: new Date(),
        })
        .where(eq(portfolios.userId, input.userId));

      return existing.id;
    }

    const portfolioId = crypto.randomUUID();
    await this.db.insert(portfolios).values({
      id: portfolioId,
      userId: input.userId,
      slug: input.slug,
      isPublic: input.isPublic,
      settings: input.settings,
    });

    return portfolioId;
  }

  /**
   * ユーザーIDでポートフォリオを取得します。
   *
   * @param userId - ユーザーのID
   * @returns ポートフォリオデータ、存在しない場合はundefined
   */
  async findByUserId(userId: string): Promise<Portfolio | undefined> {
    const rows = await this.db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId));

    const row = rows[0];
    if (!row) return undefined;

    return this.toPortfolio(row);
  }

  /**
   * Slugでポートフォリオを取得します。
   *
   * @param slug - ポートフォリオのSlug
   * @returns ポートフォリオデータ、存在しない場合はundefined
   */
  async findBySlug(slug: string): Promise<Portfolio | undefined> {
    const rows = await this.db
      .select()
      .from(portfolios)
      .where(eq(portfolios.slug, slug));

    const row = rows[0];
    if (!row) return undefined;

    return this.toPortfolio(row);
  }

  /**
   * 指定されたSlugが利用可能かチェックします。
   *
   * @param slug - チェック対象のSlug
   * @param excludeUserId - 自分自身のポートフォリオを除外するためのユーザーID
   * @returns 利用可能な場合true
   */
  async isSlugAvailable(
    slug: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const conditions = [eq(portfolios.slug, slug)];

    if (excludeUserId) {
      conditions.push(ne(portfolios.userId, excludeUserId));
    }

    const rows = await this.db
      .select({ id: portfolios.id })
      .from(portfolios)
      .where(and(...conditions));

    return rows.length === 0;
  }
}
