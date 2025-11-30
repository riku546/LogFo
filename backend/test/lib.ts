import { applyD1Migrations, env } from "cloudflare:test";
import { sign } from "hono/utils/jwt/jwt";

type GlobFn = (
  pattern: string,
  options: { eager: true; query: string; import: string },
) => Record<string, unknown>;

export const excuteMigrations = async () => {
  const migrations = (import.meta as ImportMeta & { glob: GlobFn }).glob(
    "../drizzle/*.sql",
    {
      eager: true,
      query: "?raw",
      import: "default",
    },
  );

  // 読み込んだファイルを applyD1Migrations が受け取れる形式に変換
  const migrationEvents = Object.entries(migrations)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB)) // ファイル名順（0000_..., 0001_...）に並び替え
    .map(([path, sql]) => ({
      name: path.split("/").pop() ?? path, // ファイル名をマイグレーション名とする
      queries: [sql as string], // SQLの中身
    }));

  // マイグレーションを適用
  await applyD1Migrations(env.DB, migrationEvents);
};

export const createAuthToken = async () => {
  const payload = {
    sub: "test-user-id",
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間後に期限切れ
  };

  const token = await sign(payload, env.JWT_SECRET);

  return token;
};
