const fs = require("node:fs");
const path = require("node:path");

const featureNames = fs
  .readdirSync(path.join(__dirname, "src/features"), { withFileTypes: true })
  .filter((directoryEntry) => directoryEntry.isDirectory())
  .map((directoryEntry) => directoryEntry.name);

const crossFeatureRules = featureNames.map((featureName) => ({
  name: `${featureName}-must-not-depend-on-other-features`,
  comment: "feature 間で直接依存せず、必要なら shared layer に切り出します。",
  severity: "error",
  from: { path: `^src/features/${featureName}/` },
  to: {
    path: "^src/features/",
    pathNot: `^src/features/${featureName}/`,
  },
}));

/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "components-must-not-depend-on-features",
      comment:
        "shared components は feature の実装詳細に依存しないようにします。",
      severity: "error",
      from: { path: "^src/components/" },
      to: { path: "^src/features/" },
    },
    {
      name: "components-must-not-depend-on-app",
      comment:
        "shared components は app ルーティング層に依存しないようにします。",
      severity: "error",
      from: { path: "^src/components/" },
      to: { path: "^src/app/" },
    },
    {
      name: "lib-must-not-depend-on-features",
      comment: "shared lib は feature 実装に依存しないようにします。",
      severity: "error",
      from: { path: "^src/lib/" },
      to: { path: "^src/features/" },
    },
    {
      name: "lib-must-not-depend-on-app",
      comment: "shared lib は app ルーティング層に依存しないようにします。",
      severity: "error",
      from: { path: "^src/lib/" },
      to: { path: "^src/app/" },
    },
    {
      name: "features-must-not-depend-on-app",
      comment: "feature は Next.js の app 配線層に依存しないようにします。",
      severity: "error",
      from: { path: "^src/features/" },
      to: { path: "^src/app/" },
    },
    ...crossFeatureRules,
  ],
  options: {
    baseDir: __dirname,
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
  },
};
