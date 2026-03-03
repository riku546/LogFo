import path from "node:path";
import {
  defineWorkersProject,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
  // drizzleディレクトリ内のマイグレーションを読み込む
  const migrationsPath = path.join(__dirname, "drizzle");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    test: {
      projects: [
        //ユニットテストのテストファイルはnode上で実行する
        {
          name: "unit",
          test: {
            include: ["test/unit/**/*.test.ts"],
            environment: "node",
            pool: "threads",
          },
        },
        //統合テストのテストファイルはworkers上で実行する
        defineWorkersProject({
          test: {
            pool: "@cloudflare/vitest-pool-workers",
            include: ["test/integration/**/*.test.ts"],
            setupFiles: ["./test/apply-migrations.ts"],
            poolOptions: {
              workers: {
                remoteBindings: false,
                wrangler: {
                  configPath: "./wrangler.toml",
                },
                miniflare: {
                  // マイグレーションをセットアップファイルで適用できるようにバインディングを追加
                  bindings: { TEST_MIGRATIONS: migrations, AI: {} },
                },
              },
            },
          },
        }),
      ],
    },
  };
});
