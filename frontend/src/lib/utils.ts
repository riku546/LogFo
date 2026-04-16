import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 一覧表示向けに日付入力を安全に整形します。
 * ISO文字列・SQLite風文字列・Unix秒/ミリ秒タイムスタンプを受け付け、
 * 解釈できない場合はプレースホルダーを返します。
 *
 * @param dateInput - APIから受け取った日付入力
 * @returns `ja-JP` 形式の日付文字列、または `-`
 */
export function formatDisplayDate(
  dateInput: Date | number | string | null | undefined,
): string {
  if (dateInput === null || dateInput === undefined || dateInput === "") {
    return "-";
  }

  if (dateInput instanceof Date) {
    return Number.isNaN(dateInput.getTime())
      ? "-"
      : dateInput.toLocaleDateString("ja-JP");
  }

  const normalizedTimestamp =
    typeof dateInput === "number"
      ? dateInput
      : /^\d+$/.test(dateInput.trim())
        ? Number(dateInput)
        : null;

  const parsedDate =
    normalizedTimestamp === null
      ? new Date(dateInput)
      : new Date(
          normalizedTimestamp < 1_000_000_000_000
            ? normalizedTimestamp * 1000
            : normalizedTimestamp,
        );

  return Number.isNaN(parsedDate.getTime())
    ? "-"
    : parsedDate.toLocaleDateString("ja-JP");
}
