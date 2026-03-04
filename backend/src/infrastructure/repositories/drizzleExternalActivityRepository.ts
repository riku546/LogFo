import { and, eq, gte, lte } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { ExternalActivityRepository } from "../../core/application/interfaces/externalActivityRepository";
import type { ExternalActivity } from "../../core/domain/models/externalActivity";
import { externalActivities } from "../database/schema";

export class DrizzleExternalActivityRepository
  implements ExternalActivityRepository
{
  constructor(private readonly db: DrizzleD1Database) {}

  async upsertActivities(
    activities: Omit<ExternalActivity, "id" | "createdAt" | "updatedAt">[],
  ): Promise<void> {
    if (activities.length === 0) return;

    // SQLiteのINSERT ON CONFLICT を利用して、ユーザー・プロバイダ・日付が一致する場合は更新する
    // uniqueインデックスが必要になるが、ここではDrizzleのAPIを利用してUpsert処理を書く。
    // 今回はモック的実装としてループで処理（本番ではバッチ対応や競合解決を見直す）
    for (const data of activities) {
      const existing = await this.db
        .select()
        .from(externalActivities)
        .where(
          and(
            eq(externalActivities.userId, data.userId),
            eq(externalActivities.provider, data.provider),
            eq(externalActivities.date, data.date),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(externalActivities)
          .set({
            activityCount: data.activityCount,
            metadata: data.metadata,
          })
          .where(eq(externalActivities.id, existing[0].id));
      } else {
        await this.db.insert(externalActivities).values({
          userId: data.userId,
          provider: data.provider,
          date: data.date,
          activityCount: data.activityCount,
          metadata: data.metadata,
        });
      }
    }
  }

  async getActivitiesByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<ExternalActivity[]> {
    const rows = await this.db
      .select()
      .from(externalActivities)
      .where(
        and(
          eq(externalActivities.userId, userId),
          gte(externalActivities.date, startDate),
          lte(externalActivities.date, endDate),
        ),
      );

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      provider: r.provider,
      date: r.date,
      activityCount: r.activityCount,
      metadata: r.metadata,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async getAllActivitiesByUserId(userId: string): Promise<ExternalActivity[]> {
    const rows = await this.db
      .select()
      .from(externalActivities)
      .where(eq(externalActivities.userId, userId));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      provider: r.provider,
      date: r.date,
      activityCount: r.activityCount,
      metadata: r.metadata,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }
}
