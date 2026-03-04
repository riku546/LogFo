import { IntegrationUnauthorizedError } from "../../core/application/errors/integrationError";

export interface GithubContributionDay {
  date: string;
  contributionCount: number;
}

export class GithubService {
  /**
   * GitHub GraphQL APIを使用して、指定期間のコントリビューション（草）データを取得する
   */
  async getContributions(
    accessToken: string,
    userName: string,
    from: string, // ISO8601 (e.g. 2023-10-01T00:00:00Z)
    to: string, // ISO8601
  ): Promise<GithubContributionDay[]> {
    const query = `
      query($userName:String!, $from:DateTime!, $to:DateTime!) {
        user(login: $userName) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "LogFo-App",
      },
      body: JSON.stringify({
        query,
        variables: { userName, from, to },
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new IntegrationUnauthorizedError("github");
      }
      const errorText = await response.text();
      throw new Error(
        `GitHub GraphQL API Error: ${response.status} ${errorText}`,
      );
    }

    const json = (await response.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              weeks: Array<{
                contributionDays: Array<{
                  contributionCount: number;
                  date: string;
                }>;
              }>;
            };
          };
        };
      };
      errors?: any[];
    };
    if (json.errors) {
      throw new Error(`GitHub GraphQL Error: ${JSON.stringify(json.errors)}`);
    }

    const weeks =
      json.data?.user?.contributionsCollection?.contributionCalendar?.weeks ||
      [];
    const days: GithubContributionDay[] = [];

    for (const week of weeks) {
      for (const day of week.contributionDays) {
        days.push({
          date: day.date,
          contributionCount: day.contributionCount,
        });
      }
    }

    return days;
  }
}
