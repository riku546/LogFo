/**
 * ロードマップ機能に関するAPI通信ユーティリティ
 *
 * Usage:
 * const { roadmapId } = await saveRoadmap(token, payload);
 * const { roadmaps } = await fetchRoadmapList(token);
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

// ===== 型定義 =====

export interface RoadmapTask {
  id?: string;
  title: string;
  estimatedHours: number | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  orderIndex: number;
}

export interface RoadmapMilestone {
  id?: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  orderIndex: number;
  tasks: RoadmapTask[];
}

export interface RoadmapDetail {
  id: string;
  userId: string;
  currentState: string;
  goalState: string;
  pdfContext: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: RoadmapMilestone[];
}

export interface RoadmapListItem {
  id: string;
  currentState: string;
  goalState: string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveRoadmapPayload {
  currentState: string;
  goalState: string;
  pdfContext: string | null;
  summary: string;
  milestones: Array<{
    title: string;
    description?: string;
    orderIndex: number;
    tasks: Array<{
      title: string;
      estimatedHours?: number;
      orderIndex: number;
    }>;
  }>;
}

export interface UpdateRoadmapPayload {
  currentState: string;
  goalState: string;
  pdfContext: string | null;
  summary: string | null;
  milestones: Array<{
    id?: string;
    title: string;
    description: string | null;
    status: string;
    orderIndex: number;
    tasks: Array<{
      id?: string;
      title: string;
      estimatedHours: number | null;
      status: string;
      orderIndex: number;
    }>;
  }>;
}

// ===== APIエラー =====

export class RoadmapApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "RoadmapApiError";
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
 * ロードマップ一覧を取得する
 */
export const fetchRoadmapList = async (
  token: string,
): Promise<RoadmapListItem[]> => {
  const response = await fetch(`${API_URL}/api/roadmap`, {
    headers: getHeaders(token, false),
  });

  if (!response.ok) {
    throw new RoadmapApiError(
      "ロードマップの取得に失敗しました",
      response.status,
    );
  }

  const body = (await response.json()) as { roadmaps: RoadmapListItem[] };
  return body.roadmaps;
};

/**
 * ロードマップ詳細を取得する
 */
export const fetchRoadmapDetail = async (
  token: string,
  roadmapId: string,
): Promise<RoadmapDetail> => {
  const response = await fetch(`${API_URL}/api/roadmap/${roadmapId}`, {
    headers: getHeaders(token, false),
  });

  if (!response.ok) {
    throw new RoadmapApiError(
      "ロードマップの取得に失敗しました",
      response.status,
    );
  }

  const body = (await response.json()) as { roadmap: RoadmapDetail };
  return body.roadmap;
};

/**
 * ロードマップを保存する
 */
export const saveRoadmap = async (
  token: string,
  payload: SaveRoadmapPayload,
): Promise<string> => {
  const response = await fetch(`${API_URL}/api/roadmap`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new RoadmapApiError("保存に失敗しました", response.status);
  }

  const body = (await response.json()) as { roadmapId: string };
  return body.roadmapId;
};

/**
 * ロードマップを更新する
 */
export const updateRoadmap = async (
  token: string,
  roadmapId: string,
  payload: UpdateRoadmapPayload,
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/roadmap/${roadmapId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new RoadmapApiError("更新に失敗しました", response.status);
  }
};

/**
 * ロードマップを削除する
 */
export const deleteRoadmap = async (
  token: string,
  roadmapId: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/roadmap/${roadmapId}`, {
    method: "DELETE",
    headers: getHeaders(token, false),
  });

  if (!response.ok) {
    throw new RoadmapApiError("削除に失敗しました", response.status);
  }
};

/**
 * ロードマップを生成する（ストリーミング・通常共通のリクエスト構築）
 * `useObject` にカスタムの `fetch` 関数として渡すためのもの。
 */
export const roadmapGenerateFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: {
    token: string;
    requestData: Record<string, unknown>;
    userPdfFile: File | null;
    companyPdfFile: File | null;
  },
): Promise<Response> => {
  if (!options) {
    // 通常のfetchとしてフォールバック
    return fetch(input, init);
  }

  const { token, requestData, userPdfFile, companyPdfFile } = options;

  const formData = new FormData();
  formData.append("data", JSON.stringify(requestData));
  if (userPdfFile) {
    formData.append("userPdfFile", userPdfFile);
  }
  if (companyPdfFile) {
    formData.append("companyPdfFile", companyPdfFile);
  }

  const response = await fetch(`${API_URL}/api/roadmap/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // FormDataを送信する場合はContent-Typeヘッダーをブラウザに設定させるため、あえて指定しません
    },
    body: formData,
  });

  if (!response.ok) {
    throw new RoadmapApiError(
      "ロードマップの生成に失敗しました",
      response.status,
    );
  }

  return response;
};

/**
 * 非ストリーミングでの旧API関数（後方互換 または テスト用）
 */
export const generateRoadmap = async (
  token: string,
  requestData: Record<string, unknown>,
  userPdfFile?: File | null,
  companyPdfFile?: File | null,
): Promise<Response> => {
  return roadmapGenerateFetch(`${API_URL}/api/roadmap/generate`, undefined, {
    token,
    requestData,
    userPdfFile: userPdfFile || null,
    companyPdfFile: companyPdfFile || null,
  });
};
