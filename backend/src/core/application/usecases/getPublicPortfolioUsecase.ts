import type { PortfolioSettings } from "../../../schema/portfolio";
import type { Summary } from "../../domain/models/summary";
import type { PortfolioRepository } from "../interfaces/portfolioRepository";
import type { RoadmapRepository } from "../interfaces/roadmapRepository";
import type { SummaryRepository } from "../interfaces/summaryRepository";

/**
 * ポートフォリオが非公開の場合のエラー
 */
export class PortfolioNotPublicError extends Error {
  constructor() {
    super("このポートフォリオは非公開です");
    this.name = "PortfolioNotPublicError";
  }
}

/**
 * ポートフォリオが見つからない場合のエラー
 */
export class PortfolioNotFoundError extends Error {
  constructor() {
    super("ポートフォリオが見つかりません");
    this.name = "PortfolioNotFoundError";
  }
}

/**
 * 公開ポートフォリオの返却データ型
 */
export interface PublicPortfolioData {
  readonly slug: string;
  readonly settings: PortfolioSettings;
  readonly summaries: Summary[];
  readonly roadmaps: Array<{
    readonly id: string;
    readonly currentState: string;
    readonly goalState: string;
    readonly summary: string | null;
  }>;
}

/**
 * 公開ポートフォリオをSlugで取得するユースケース
 * settings内のIDに基づいて関連データ（summaries, roadmaps）もまとめて返却します。
 */
export class GetPublicPortfolioUsecase {
  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly summaryRepository: SummaryRepository,
    private readonly roadmapRepository: RoadmapRepository,
  ) {}

  /**
   * Slugで公開ポートフォリオとその関連データを取得します。
   *
   * @param slug - ポートフォリオのSlug
   * @returns 公開ポートフォリオデータ
   * @throws {PortfolioNotFoundError} 該当Slugのポートフォリオが存在しない場合
   * @throws {PortfolioNotPublicError} ポートフォリオが非公開の場合
   */
  async execute(slug: string): Promise<PublicPortfolioData> {
    const portfolio = await this.portfolioRepository.findBySlug(slug);

    if (!portfolio) {
      throw new PortfolioNotFoundError();
    }

    if (!portfolio.isPublic) {
      throw new PortfolioNotPublicError();
    }

    const settings = portfolio.settings;
    if (!settings) {
      throw new PortfolioNotFoundError();
    }

    // settings内のIDに基づいて関連データを取得
    const summaryIds = settings.sections?.summaryIds ?? [];
    const roadmapIds = settings.sections?.roadmapIds ?? [];

    // サマリーとロードマップを並列取得（N+1回避のため、各IDごとに個別fetchしてPromise.allで並列化）
    const [summaries, roadmaps] = await Promise.all([
      this.fetchSummaries(summaryIds),
      this.fetchRoadmaps(roadmapIds),
    ]);

    return {
      slug: portfolio.slug,
      settings,
      summaries,
      roadmaps,
    };
  }

  /**
   * サマリーIDの配列からサマリーデータを取得する
   */
  private async fetchSummaries(summaryIds: string[]): Promise<Summary[]> {
    if (summaryIds.length === 0) return [];

    const results = await Promise.all(
      summaryIds.map((id) => this.summaryRepository.findById(id)),
    );
    return results.filter(
      (summary): summary is Summary => summary !== undefined,
    );
  }

  /**
   * ロードマップIDの配列からロードマップデータを取得する
   */
  private async fetchRoadmaps(
    roadmapIds: string[],
  ): Promise<PublicPortfolioData["roadmaps"]> {
    if (roadmapIds.length === 0) return [];

    const results = await Promise.all(
      roadmapIds.map((id) => this.roadmapRepository.findById(id)),
    );
    return results
      .filter(
        (roadmap): roadmap is NonNullable<typeof roadmap> =>
          roadmap !== undefined,
      )
      .map((roadmap) => ({
        id: roadmap.id,
        currentState: roadmap.currentState,
        goalState: roadmap.goalState,
        summary: roadmap.summary,
      }));
  }
}
