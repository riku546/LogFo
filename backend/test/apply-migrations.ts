import { applyD1Migrations, env } from "cloudflare:test";

// セットアップファイルは分離されたストレージの外部で実行され、複数回実行される可能性があります。
// applyD1Migrations() は未適用のマイグレーションのみを適用するため、ここで呼び出しても安全です。
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
