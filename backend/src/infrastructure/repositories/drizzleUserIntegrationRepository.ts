import { and, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { UserIntegrationRepository } from "../../core/application/interfaces/userIntegrationRepository";
import type { UserIntegration } from "../../core/domain/models/userIntegration";
import { userIntegrations } from "../database/schema";

export class DrizzleUserIntegrationRepository
  implements UserIntegrationRepository
{
  constructor(private readonly db: DrizzleD1Database) {}

  async getByProvider(
    userId: string,
    provider: string,
  ): Promise<UserIntegration | null> {
    const rows = await this.db
      .select()
      .from(userIntegrations)
      .where(
        and(
          eq(userIntegrations.userId, userId),
          eq(userIntegrations.provider, provider as any),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: r.userId,
      provider: r.provider,
      providerUserId: r.providerUserId,
      accessToken: r.accessToken,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async getAllByUserId(userId: string): Promise<UserIntegration[]> {
    const rows = await this.db
      .select()
      .from(userIntegrations)
      .where(eq(userIntegrations.userId, userId));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      provider: r.provider,
      providerUserId: r.providerUserId,
      accessToken: r.accessToken,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async upsertIntegration(
    integration: Omit<UserIntegration, "id" | "createdAt" | "updatedAt">,
  ): Promise<UserIntegration> {
    const existing = await this.getByProvider(
      integration.userId,
      integration.provider,
    );

    if (existing) {
      const [updated] = await this.db
        .update(userIntegrations)
        .set({
          providerUserId: integration.providerUserId,
          accessToken: integration.accessToken,
        })
        .where(eq(userIntegrations.id, existing.id))
        .returning();

      return {
        ...updated,
        providerUserId: updated.providerUserId,
        accessToken: updated.accessToken,
      };
    }

    const [inserted] = await this.db
      .insert(userIntegrations)
      .values({
        userId: integration.userId,
        provider: integration.provider as any,
        providerUserId: integration.providerUserId,
        accessToken: integration.accessToken,
      })
      .returning();

    return {
      ...inserted,
      providerUserId: inserted.providerUserId,
      accessToken: inserted.accessToken,
    };
  }
}
