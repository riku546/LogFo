import { describe, expect, it, vi } from "vitest";
import type { PortfolioRepository } from "../../src/core/application/interfaces/portfolioRepository";
import { GetPortfolioUsecase } from "../../src/core/application/usecases/getPortfolioUsecase";

const createMockRepository = () =>
  ({
    upsert: vi.fn<PortfolioRepository["upsert"]>(),
    findByUserId: vi.fn<PortfolioRepository["findByUserId"]>(),
    findBySlug: vi.fn<PortfolioRepository["findBySlug"]>(),
    isSlugAvailable: vi.fn<PortfolioRepository["isSlugAvailable"]>(),
  }) satisfies PortfolioRepository;

describe("GetPortfolioUsecase", () => {
  it("ユーザーIDに紐づくポートフォリオを返す", async () => {
    const repository = createMockRepository();
    repository.findByUserId.mockResolvedValue({
      id: "portfolio-1",
      userId: "user-1",
      slug: "my-portfolio",
      isPublic: true,
      settings: null,
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    });

    const usecase = new GetPortfolioUsecase(repository);
    const result = await usecase.execute("user-1");

    expect(result?.id).toBe("portfolio-1");
    expect(repository.findByUserId).toHaveBeenCalledWith("user-1");
  });
});
