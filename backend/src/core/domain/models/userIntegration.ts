/**
 * 外部データ連携（OAuth等）に関するユーザー設定のエンティティ
 */
export interface UserIntegration {
  readonly id: string;
  readonly userId: string;
  readonly provider: "github" | "wakatime" | "qiita" | "zenn" | "atcoder";
  readonly providerUserId: string | null;
  readonly accessToken: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
