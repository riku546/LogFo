import { client } from "@/lib/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

/**
 * ポートフォリオ機能に関するAPI通信ユーティリティ
 *
 * Usage:
 * const portfolio = await fetchMyPortfolio(token);
 * const portfolioId = await savePortfolio(token, payload);
 * const publicData = await fetchPublicPortfolio("riku");
 */

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

export interface PortfolioGenerationSettings {
  selectedSummaryIds: string[];
  chatInput: string;
  targetSection: PortfolioGeneratedSectionKey;
}

export interface PortfolioGeneratedContent {
  selfPr: string;
  strengths: string;
  learnings: string;
  futureVision: string;
}

export interface PortfolioSettings {
  profile: ProfileSettings;
  generation: PortfolioGenerationSettings;
  generatedContent: PortfolioGeneratedContent;
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
}

export type PortfolioGeneratedSectionKey =
  | "selfPr"
  | "strengths"
  | "learnings"
  | "futureVision";

export interface GeneratePortfolioContentPayload {
  chatInput: string;
  targetSection: PortfolioGeneratedSectionKey;
  selectedSummaryIds: string[];
  currentContent: PortfolioGeneratedContent;
}

export interface PortfolioContentStreamHandlers {
  onDelta: (chunk: string) => void;
  onComplete: (text: string) => void;
  onError?: (message: string) => void;
}

type PortfolioSseEvent = {
  eventName: string;
  payloadData: {
    text?: string;
    message?: string;
  };
};

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

const parsePortfolioSseEvent = (block: string): PortfolioSseEvent | null => {
  const lines = block.split(/\r?\n/);
  const eventName = lines
    .find((line) => line.startsWith("event:"))
    ?.replace("event:", "")
    .trim();
  const dataLine = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace("data:", "").trim())
    .join("\n");

  if (!(eventName && dataLine)) {
    return null;
  }

  try {
    return {
      eventName,
      payloadData: JSON.parse(dataLine) as {
        text?: string;
        message?: string;
      },
    };
  } catch {
    return null;
  }
};

const dispatchPortfolioSseEvent = (
  event: PortfolioSseEvent,
  handlers: PortfolioContentStreamHandlers,
) => {
  if (event.eventName === "delta" && event.payloadData.text) {
    handlers.onDelta(event.payloadData.text);
    return;
  }

  if (event.eventName === "complete") {
    handlers.onComplete(event.payloadData.text ?? "");
    return;
  }

  if (event.eventName === "error") {
    handlers.onError?.(
      event.payloadData.message ?? "ポートフォリオ文章の生成に失敗しました",
    );
  }
};

// ===== API関数 =====

/**
 * 自分のポートフォリオ設定を取得する
 */
export const fetchMyPortfolio = async (
  token: string,
): Promise<PortfolioData | null> => {
  const response = await client.api.portfolio.$get(
    {},
    { headers: getHeaders(token, false) },
  );

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
  const response = await client.api.portfolio.$post(
    {
      json: payload,
    },
    { headers: getHeaders(token) },
  );

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

  const body = (await response.json()) as { portfolioId: string };
  return body.portfolioId;
};

/**
 * 公開ポートフォリオを取得する（認証不要）
 */
export const fetchPublicPortfolio = async (
  slug: string,
): Promise<PublicPortfolioData> => {
  const response = await client.portfolio.public[":slug"].$get({
    param: { slug },
  });

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

  const body = (await response.json()) as { portfolio: PublicPortfolioData };
  return body.portfolio;
};

/**
 * ポートフォリオ向け文章をAI生成する
 */
export const generatePortfolioContent = async (
  token: string,
  payload: GeneratePortfolioContentPayload,
): Promise<PortfolioGeneratedContent> => {
  void token;
  void payload;
  throw new Error(
    "generatePortfolioContentは廃止予定です。generatePortfolioContentStreamを利用してください",
  );
};

/**
 * ポートフォリオ向け文章をSSEでストリーミング生成する
 */
export const generatePortfolioContentStream = async (
  token: string,
  payload: GeneratePortfolioContentPayload,
  handlers: PortfolioContentStreamHandlers,
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/portfolio/generate`, {
    method: "POST",
    headers: {
      ...getHeaders(token),
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!(response.ok && response.body)) {
    throw new PortfolioApiError(
      "ポートフォリオ文章の生成に失敗しました",
      response.status,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const eventSeparatorPattern = /\r?\n\r?\n/;

  const handleEventBlock = (block: string) => {
    const parsedEvent = parsePortfolioSseEvent(block);
    if (!parsedEvent) {
      return;
    }

    dispatchPortfolioSseEvent(parsedEvent, handlers);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let separatorMatch = buffer.match(eventSeparatorPattern);
    while (separatorMatch?.index !== undefined) {
      const separatorStartIndex = separatorMatch.index;
      const eventBlock = buffer.slice(0, separatorStartIndex);
      buffer = buffer.slice(separatorStartIndex + separatorMatch[0].length);
      handleEventBlock(eventBlock);
      separatorMatch = buffer.match(eventSeparatorPattern);
    }
  }

  if (buffer.trim()) {
    handleEventBlock(buffer.trim());
  }
};
