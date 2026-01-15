import path from "node:path";
import {
  defineWorkersProject,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersProject(async () => {
  // drizzleディレクトリ内のマイグレーションを読み込む
  const migrationsPath = path.join(__dirname, "drizzle");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    test: {
      setupFiles: ["./test/apply-migrations.ts"],
      poolOptions: {
        workers: {
          wrangler: {
            configPath: "./wrangler.toml",
          },
          miniflare: {
            // マイグレーションをセットアップファイルで適用できるようにバインディングを追加
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
