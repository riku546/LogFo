// test/env.d.ts
import type { D1Migration } from "@cloudflare/vitest-pool-workers";

declare module "cloudflare:test" {
  // import("cloudflare:test").env の型を制御します
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: D1Migration[]; // vite.config.ts で定義
  }
}
