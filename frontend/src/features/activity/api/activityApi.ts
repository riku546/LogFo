/**
 * 活動記録機能に関するAPI通信ユーティリティ
 *
 * Usage:
 * const logs = await fetchActivityLogs(token, taskId);
 * const { activityLogId } = await createActivityLog(token, payload);
 */
import { client } from "@/lib/client";

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
  const response = await client.api.activities[":taskId"].$get(
    {
      param: { taskId },
    },
    { headers: getHeaders(token, false) },
  );

  if (!response.ok) {
    throw new ActivityApiError("活動記録の取得に失敗しました", response.status);
  }

  const body: {
    activityLogs: ActivityLogItem[];
  } = await response.json();
  return body.activityLogs;
};

/**
 * 活動記録を新規作成する
 */
export const createActivityLog = async (
  token: string,
  payload: CreateActivityLogPayload,
): Promise<string> => {
  const response = await client.api.activities.$post(
    {
      json: payload,
    },
    { headers: getHeaders(token) },
  );

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
  const response = await client.api.activities[":activityId"].$put(
    {
      param: { activityId },
      json: { content },
    },
    { headers: getHeaders(token) },
  );

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
  const response = await client.api.activities[":activityId"].$delete(
    {
      param: { activityId },
    },
    { headers: getHeaders(token, false) },
  );

  if (!response.ok) {
    throw new ActivityApiError("活動記録の削除に失敗しました", response.status);
  }
};
