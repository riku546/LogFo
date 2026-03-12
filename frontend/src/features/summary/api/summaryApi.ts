/**
 * サマリー機能に関するAPI通信ユーティリティ
 *
 * Usage:
 * const summaries = await fetchSummariesByMilestone(token, milestoneId);
 * const summaryId = await saveSummary(token, payload);
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

// ===== 型定義 =====

export interface SummaryItem {
  id: string;
  userId: string;
  milestoneId: string;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSummaryPayload {
  milestoneId: string;
  title: string;
  content: string;
}

export interface UpdateSummaryPayload {
  title: string;
  content: string;
}

export type SummaryFormat = "self_pr" | "monthly_report" | "casual_review";

// ===== APIエラー =====

export class SummaryApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "SummaryApiError";
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
 * マイルストーンに紐づくサマリー一覧を取得する
 */
export const fetchSummariesByMilestone = async (
  token: string,
  milestoneId: string,
): Promise<SummaryItem[]> => {
  const response = await fetch(
    `${API_URL}/api/summary/milestone/${milestoneId}`,
    {
      headers: getHeaders(token, false),
    },
  );

  if (!response.ok) {
    throw new SummaryApiError("サマリーの取得に失敗しました", response.status);
  }

  const body: { summaries: SummaryItem[] } = await response.json();
  return body.summaries;
};

/**
 * サマリーを保存する
 */
export const saveSummary = async (
  token: string,
  payload: SaveSummaryPayload,
): Promise<string> => {
  const response = await fetch(`${API_URL}/api/summary`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new SummaryApiError("サマリーの保存に失敗しました", response.status);
  }

  const body: { summaryId: string } = await response.json();
  return body.summaryId;
};

/**
 * サマリーを更新する
 */
export const updateSummary = async (
  token: string,
  summaryId: string,
  payload: UpdateSummaryPayload,
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/summary/${summaryId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new SummaryApiError("サマリーの更新に失敗しました", response.status);
  }
};

/**
 * サマリーを削除する
 */
export const deleteSummary = async (
  token: string,
  summaryId: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/summary/${summaryId}`, {
    method: "DELETE",
    headers: getHeaders(token, false),
  });

  if (!response.ok) {
    throw new SummaryApiError("サマリーの削除に失敗しました", response.status);
  }
};

/**
 * サマリー生成用のストリーミングfetch関数
 * Vercel AI SDK の useCompletion にカスタムfetchとして渡すためのもの。
 */
export const summaryGenerateFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: {
    token: string;
    milestoneId: string;
    format: SummaryFormat;
  },
): Promise<Response> => {
  if (!options) {
    return fetch(input, init);
  }

  const { token, milestoneId, format } = options;

  const response = await fetch(`${API_URL}/api/summary/generate`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ milestoneId, format }),
  });

  if (!response.ok) {
    throw new SummaryApiError("サマリーの生成に失敗しました", response.status);
  }

  return response;
};
