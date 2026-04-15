import { describe, expect, it, vi } from "vitest";
import type { ExternalActivityRepository } from "../../../src/core/application/interfaces/externalActivityRepository";
import type {
  GithubContributionDay,
  GithubContributionService,
} from "../../../src/core/application/interfaces/githubContributionService";
import type { UserIntegrationRepository } from "../../../src/core/application/interfaces/userIntegrationRepository";
import type {
  WakatimeSummary,
  WakatimeSummaryService,
} from "../../../src/core/application/interfaces/wakatimeSummaryService";
import { SyncExternalDataUsecase } from "../../../src/core/application/usecases/dashboard/syncExternalDataUsecase";

const createExternalActivityRepository = () =>
  ({
    upsertActivities: vi.fn<ExternalActivityRepository["upsertActivities"]>(),
    getActivitiesByDateRange:
      vi.fn<ExternalActivityRepository["getActivitiesByDateRange"]>(),
    getAllActivitiesByUserId:
      vi.fn<ExternalActivityRepository["getAllActivitiesByUserId"]>(),
  }) satisfies ExternalActivityRepository;

const createUserIntegrationRepository = () =>
  ({
    getByProvider: vi.fn<UserIntegrationRepository["getByProvider"]>(),
    getAllByUserId: vi.fn<UserIntegrationRepository["getAllByUserId"]>(),
    upsertIntegration: vi.fn<UserIntegrationRepository["upsertIntegration"]>(),
  }) satisfies UserIntegrationRepository;

const createGithubService = () =>
  ({
    getContributions: vi.fn<GithubContributionService["getContributions"]>(),
  }) satisfies Pick<GithubContributionService, "getContributions">;

const createWakatimeService = () =>
  ({
    getSummaries: vi.fn<WakatimeSummaryService["getSummaries"]>(),
  }) satisfies Pick<WakatimeSummaryService, "getSummaries">;

describe("SyncExternalDataUsecase", () => {
  it("githubプロバイダーを同期できる", async () => {
    const externalActivityRepository = createExternalActivityRepository();
    const userIntegrationRepository = createUserIntegrationRepository();
    const githubService = createGithubService();
    const wakatimeService = createWakatimeService();

    userIntegrationRepository.getByProvider.mockResolvedValue({
      id: "integration-1",
      userId: "user-1",
      provider: "github",
      providerUserId: "octocat",
      accessToken: "token",
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });
    githubService.getContributions.mockResolvedValue([
      { date: "2026-03-12", contributionCount: 3 },
    ] satisfies GithubContributionDay[]);

    const usecase = new SyncExternalDataUsecase(
      externalActivityRepository,
      userIntegrationRepository,
      githubService as GithubContributionService,
      wakatimeService as WakatimeSummaryService,
    );

    const count = await usecase.execute("user-1", "github");
    expect(count).toBe(1);
    expect(externalActivityRepository.upsertActivities).toHaveBeenCalledTimes(
      1,
    );
  });

  it("wakatimeプロバイダーを同期できる", async () => {
    const externalActivityRepository = createExternalActivityRepository();
    const userIntegrationRepository = createUserIntegrationRepository();
    const githubService = createGithubService();
    const wakatimeService = createWakatimeService();

    userIntegrationRepository.getByProvider.mockResolvedValue({
      id: "integration-2",
      userId: "user-1",
      provider: "wakatime",
      providerUserId: "riku",
      accessToken: "token",
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });
    wakatimeService.getSummaries.mockResolvedValue([
      { date: "2026-03-12", totalSeconds: 3600 },
    ] satisfies WakatimeSummary[]);

    const usecase = new SyncExternalDataUsecase(
      externalActivityRepository,
      userIntegrationRepository,
      githubService as GithubContributionService,
      wakatimeService as WakatimeSummaryService,
    );

    const count = await usecase.execute("user-1", "wakatime");
    expect(count).toBe(1);
    expect(externalActivityRepository.upsertActivities).toHaveBeenCalledTimes(
      1,
    );
  });

  it("連携情報がない場合はエラー", async () => {
    const usecase = new SyncExternalDataUsecase(
      createExternalActivityRepository(),
      createUserIntegrationRepository(),
      createGithubService() as GithubContributionService,
      createWakatimeService() as WakatimeSummaryService,
    );

    await expect(usecase.execute("user-1", "github")).rejects.toThrow(
      "not found or not authorized",
    );
  });

  it("未対応プロバイダーはエラー", async () => {
    const userIntegrationRepository = createUserIntegrationRepository();
    userIntegrationRepository.getByProvider.mockResolvedValue({
      id: "integration-3",
      userId: "user-1",
      provider: "github",
      providerUserId: "octocat",
      accessToken: "token",
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });

    const usecase = new SyncExternalDataUsecase(
      createExternalActivityRepository(),
      userIntegrationRepository,
      createGithubService() as GithubContributionService,
      createWakatimeService() as WakatimeSummaryService,
    );

    await expect(usecase.execute("user-1", "zenn")).rejects.toThrow(
      "not implemented",
    );
  });
});
