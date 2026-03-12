/**
 * ポートフォリオ機能に関するAPI通信ユーティリティ
 *
 * Usage:
 * const portfolio = await fetchMyPortfolio(token);
 * const portfolioId = await savePortfolio(token, payload);
 * const publicData = await fetchPublicPortfolio("riku");
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

// ===== 型定義 =====

export interface SocialLinks {
  github?: string;
  x?: string;
  zenn?: string;
  qiita?: string;
  atcoder?: string;
  website?: string;
}

export interface CareerStory {
  id: string;
  title: string;
  organization: string;
  periodFrom: string;
  periodTo?: string;
  isCurrent: boolean;
  story: string;
}

export interface ProfileSettings {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: SocialLinks;
  careerStories: CareerStory[];
  skills: string[];
}

export interface SectionSettings {
  roadmapIds: string[];
  summaryIds: string[];
}

export interface PortfolioSettings {
  profile: ProfileSettings;
  sections: SectionSettings;
}

export interface PortfolioData {
  id: string;
  userId: string;
  slug: string;
  isPublic: boolean;
  settings: PortfolioSettings | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavePortfolioPayload {
  slug: string;
  isPublic: boolean;
  settings: PortfolioSettings;
}

export interface PublicPortfolioData {
  slug: string;
  settings: PortfolioSettings;
  summaries: Array<{
    id: string;
    title: string | null;
    content: string;
    createdAt: string;
  }>;
  roadmaps: Array<{
    id: string;
    currentState: string;
    goalState: string;
    summary: string | null;
  }>;
}

// ===== APIエラー =====

export class PortfolioApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "PortfolioApiError";
  }
}

// ===== ヘルパー =====

const getHeaders = (token: string, includeContentType = true) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

// ===== API関数 =====

/**
 * 自分のポートフォリオ設定を取得する
 */
export const fetchMyPortfolio = async (
  token: string,
): Promise<PortfolioData | null> => {
  const response = await fetch(`${API_URL}/api/portfolio`, {
    headers: getHeaders(token, false),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new PortfolioApiError(
      "ポートフォリオの取得に失敗しました",
      response.status,
    );
  }

  const body: { portfolio: PortfolioData } = await response.json();
  return body.portfolio;
};

/**
 * ポートフォリオ設定を保存する（UPSERT）
 */
export const savePortfolio = async (
  token: string,
  payload: SavePortfolioPayload,
): Promise<string> => {
  const response = await fetch(`${API_URL}/api/portfolio`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (response.status === 409) {
    throw new PortfolioApiError(
      "このURLは既に使用されています",
      response.status,
    );
  }

  if (!response.ok) {
    throw new PortfolioApiError(
      "ポートフォリオの保存に失敗しました",
      response.status,
    );
  }

  const body: { portfolioId: string } = await response.json();
  return body.portfolioId;
};

/**
 * 公開ポートフォリオを取得する（認証不要）
 */
export const fetchPublicPortfolio = async (
  slug: string,
): Promise<PublicPortfolioData> => {
  const response = await fetch(`${API_URL}/portfolio/public/${slug}`);

  if (response.status === 404) {
    throw new PortfolioApiError(
      "ポートフォリオが見つかりません",
      response.status,
    );
  }

  if (response.status === 403) {
    throw new PortfolioApiError(
      "このポートフォリオは非公開です",
      response.status,
    );
  }

  if (!response.ok) {
    throw new PortfolioApiError(
      "ポートフォリオの取得に失敗しました",
      response.status,
    );
  }

  const body: { portfolio: PublicPortfolioData } = await response.json();
  return body.portfolio;
};
