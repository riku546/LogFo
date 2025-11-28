// test/env.d.ts
declare module "cloudflare:test" {
    // import("cloudflare:test").env の型を制御します
    interface ProvidedEnv extends Env {}
}