import { describe, expect, it } from "vitest";
import { formatDisplayDate } from "@/lib/utils";

describe("formatDisplayDate", () => {
  it("ISO文字列を日本語日付に整形する", () => {
    expect(formatDisplayDate("2026-03-12T00:00:00.000Z")).toBe("2026/3/12");
  });

  it("Unix秒タイムスタンプ文字列を正しく解釈する", () => {
    expect(formatDisplayDate("1773273600")).toBe("2026/3/12");
  });

  it("SQLite風日時文字列を日本語日付に整形する", () => {
    expect(formatDisplayDate("2026-04-16 01:17:20")).toBe("2026/4/16");
  });

  it("不正な値はプレースホルダーを返す", () => {
    expect(formatDisplayDate("invalid-date")).toBe("-");
    expect(formatDisplayDate("")).toBe("-");
  });
});
