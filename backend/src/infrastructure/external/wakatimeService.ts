import { IntegrationUnauthorizedError } from "../../core/application/errors/integrationError";

export interface WakatimeSummary {
  date: string;
  totalSeconds: number;
}

export class WakatimeService {
  /**
   * WakaTime Summaries APIを使用して、指定期間の活動データを取得する
   */
  async getSummaries(
    accessToken: string,
    start: string, // YYYY-MM-DD
    end: string, // YYYY-MM-DD
  ): Promise<WakatimeSummary[]> {
    const url = new URL("https://wakatime.com/api/v1/users/current/summaries");
    url.searchParams.set("start", start);
    url.searchParams.set("end", end);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new IntegrationUnauthorizedError("wakatime");
      }
      const errorText = await response.text();
      throw new Error(`WakaTime API Error: ${response.status} ${errorText}`);
    }

    const json = (await response.json()) as {
      data: Array<{
        grand_total: {
          total_seconds: number;
        };
        range: {
          date: string;
        };
      }>;
    };

    return json.data.map((day) => ({
      date: day.range.date,
      totalSeconds: Math.floor(day.grand_total.total_seconds),
    }));
  }
}
