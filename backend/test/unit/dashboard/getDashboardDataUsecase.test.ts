import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExternalActivityRepository } from "../../../src/core/application/interfaces/externalActivityRepository";
import { GetDashboardDataUsecase } from "../../../src/core/application/usecases/dashboard/getDashboardDataUsecase";

const createMockRepository = () =>
  ({
    upsertActivities: vi.fn<ExternalActivityRepository["upsertActivities"]>(),
    getActivitiesByDateRange:
      vi.fn<ExternalActivityRepository["getActivitiesByDateRange"]>(),
    getAllActivitiesByUserId:
      vi.fn<ExternalActivityRepository["getAllActivitiesByUserId"]>(),
  }) satisfies ExternalActivityRepository;

describe("GetDashboardDataUsecase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T09:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("プロバイダー別の10日データとバッテリーを返す", async () => {
    const repository = createMockRepository();
    repository.getActivitiesByDateRange.mockResolvedValue([
      {
        id: "1",
        userId: "user-1",
        provider: "github",
        date: "2026-03-12",
        activityCount: 5,
        metadata: null,
        createdAt: new Date("2026-03-12"),
        updatedAt: new Date("2026-03-12"),
      },
    ]);
    repository.getAllActivitiesByUserId.mockResolvedValue([
      {
        id: "1",
        userId: "user-1",
        provider: "github",
        date: "2026-03-12",
        activityCount: 5,
        metadata: null,
        createdAt: new Date("2026-03-12"),
        updatedAt: new Date("2026-03-12"),
      },
    ]);

    const usecase = new GetDashboardDataUsecase(repository);
    const result = await usecase.getProviderWidgetsData("user-1");

    expect(result.github.last10Days).toHaveLength(10);
    expect(result.github.batteryLevel).toBe(100);
    expect(repository.getActivitiesByDateRange).toHaveBeenCalledWith(
      "user-1",
      "2026-03-03",
      "2026-03-12",
    );
  });

  it("statsデータで合計値とプロバイダー分布を返す", async () => {
    const repository = createMockRepository();
    repository.getAllActivitiesByUserId.mockResolvedValue([
      {
        id: "1",
        userId: "user-1",
        provider: "github",
        date: "2026-03-12",
        activityCount: 5,
        metadata: null,
        createdAt: new Date("2026-03-12"),
        updatedAt: new Date("2026-03-12"),
      },
      {
        id: "2",
        userId: "user-1",
        provider: "wakatime",
        date: "2026-03-12",
        activityCount: 10,
        metadata: null,
        createdAt: new Date("2026-03-12"),
        updatedAt: new Date("2026-03-12"),
      },
      {
        id: "3",
        userId: "user-1",
        provider: "github",
        date: "2026-03-11",
        activityCount: 2,
        metadata: null,
        createdAt: new Date("2026-03-11"),
        updatedAt: new Date("2026-03-11"),
      },
    ]);

    const usecase = new GetDashboardDataUsecase(repository);
    const result = await usecase.getStatsData("user-1");

    expect(result.totalActivities).toBe(17);
    expect(result.providerDistribution).toEqual({ github: 7, wakatime: 10 });
  });
});
