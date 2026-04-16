import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATE_PLACEHOLDER = "-";

/**
 * 文字列から `YYYY-MM-DD` 部分を抜き出して表示用へ変換します。
 *
 * @param dateText - 日付を含む文字列
 * @returns 変換できた場合は `YYYY/M/D`、そうでなければ `null`
 */
function extractCalendarDate(dateText: string): string | null {
  const matchedCalendarDate = dateText.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (!matchedCalendarDate) {
    return null;
  }

  const [, year, month, day] = matchedCalendarDate;
  return `${year}/${Number(month)}/${Number(day)}`;
}

/**
 * Unix秒/ミリ秒タイムスタンプ入力を正規化します。
 *
 * @param dateInput - APIから受け取った日付入力
 * @returns タイムスタンプ解釈できた場合は数値、そうでなければ `null`
 */
function normalizeTimestampInput(dateInput: number | string): number | null {
  if (typeof dateInput === "number") {
    return dateInput;
  }

  return /^\d+$/.test(dateInput.trim()) ? Number(dateInput) : null;
}

/**
 * 表示用に Date をフォーマットします。
 *
 * @param dateValue - 表示対象の Date
 * @returns `ja-JP` 形式の日付文字列、または `-`
 */
function formatDisplayDateFromDate(dateValue: Date): string {
  return Number.isNaN(dateValue.getTime())
    ? DATE_PLACEHOLDER
    : dateValue.toLocaleDateString("ja-JP");
}

/**
 * 数値タイムスタンプを Date に変換します。
 *
 * @param timestamp - Unix秒またはミリ秒タイムスタンプ
 * @returns 変換後の Date
 */
function buildDateFromTimestamp(timestamp: number): Date {
  return new Date(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp);
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
    return DATE_PLACEHOLDER;
  }

  if (dateInput instanceof Date) {
    return formatDisplayDateFromDate(dateInput);
  }

  if (typeof dateInput === "string") {
    const extractedCalendarDate = extractCalendarDate(dateInput.trim());

    if (extractedCalendarDate) {
      return extractedCalendarDate;
    }
  }

  const normalizedTimestamp = normalizeTimestampInput(dateInput);
  const parsedDate =
    normalizedTimestamp === null
      ? new Date(dateInput)
      : buildDateFromTimestamp(normalizedTimestamp);

  return formatDisplayDateFromDate(parsedDate);
}
