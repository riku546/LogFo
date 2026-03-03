/**
 * 活動記録機能に関するAPI通信ユーティリティ
 *
 * Usage:
 * const logs = await fetchActivityLogs(token, taskId);
 * const { activityLogId } = await createActivityLog(token, payload);
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

// ===== 型定義 =====

export interface ActivityLogItem {
  id: string;
  userId: string;
  taskId: string;
  content: string;
  loggedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityLogPayload {
  taskId: string;
  content: string;
  loggedDate: string;
}

// ===== APIエラー =====

export class ActivityApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ActivityApiError";
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
 * タスクに紐づく活動記録一覧を取得する
 */
export const fetchActivityLogs = async (
  token: string,
  taskId: string,
): Promise<ActivityLogItem[]> => {
  const response = await fetch(`${API_URL}/api/activities/${taskId}`, {
    headers: getHeaders(token, false),
  });

  if (!response.ok) {
    throw new ActivityApiError("活動記録の取得に失敗しました", response.status);
  }

  const body = (await response.json()) as {
    activityLogs: ActivityLogItem[];
  };
  return body.activityLogs;
};

/**
 * 活動記録を新規作成する
 */
export const createActivityLog = async (
  token: string,
  payload: CreateActivityLogPayload,
): Promise<string> => {
  const response = await fetch(`${API_URL}/api/activities`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ActivityApiError("活動記録の保存に失敗しました", response.status);
  }

  const body = (await response.json()) as { activityLogId: string };
  return body.activityLogId;
};

/**
 * 活動記録を更新する
 */
export const updateActivityLog = async (
  token: string,
  activityId: string,
  content: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/activities/${activityId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new ActivityApiError("活動記録の更新に失敗しました", response.status);
  }
};

/**
 * 活動記録を削除する
 */
export const deleteActivityLog = async (
  token: string,
  activityId: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/activities/${activityId}`, {
    method: "DELETE",
    headers: getHeaders(token, false),
  });

  if (!response.ok) {
    throw new ActivityApiError("活動記録の削除に失敗しました", response.status);
  }
};
