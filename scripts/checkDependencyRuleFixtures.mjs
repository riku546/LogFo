import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * 指定したフィクスチャで依存違反が検出されることを検証します。
 *
 * @param {string} targetName - テスト対象名
 * @param {string} fixtureDir - フィクスチャの基準ディレクトリ
 * @param {string} configPath - 利用する dependency-cruiser 設定ファイル
 */
const assertFixtureHasViolation = async (
  targetName,
  fixtureDir,
  configPath,
) => {
  try {
    execFileSync(
      "pnpm",
      [
        "exec",
        "depcruise",
        "--config",
        configPath,
        "src",
        "--output-type",
        "err",
      ],
      {
        cwd: fixtureDir,
        stdio: "pipe",
      },
    );
  } catch (error) {
    if (error && typeof error === "object" && "status" in error) {
      return;
    }
  }

  throw new Error(`${targetName} の依存違反フィクスチャを検出できませんでした。`);
};

const frontendFixtureDir = path.resolve(
  "tests/architecture/fixtures/frontend",
);
const backendFixtureDir = path.resolve("tests/architecture/fixtures/backend");

await assertFixtureHasViolation(
  "frontend",
  frontendFixtureDir,
  path.join(frontendFixtureDir, "dependency-cruiser.cjs"),
);
await assertFixtureHasViolation(
  "backend",
  backendFixtureDir,
  path.join(backendFixtureDir, "dependency-cruiser.cjs"),
);

process.stdout.write("dependency rule fixtures: ok\n");
