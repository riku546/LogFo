/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "domain-must-not-depend-on-application",
      comment: "domain は application 層に依存しないようにします。",
      severity: "error",
      from: { path: "^src/core/domain/" },
      to: { path: "^src/core/application/" },
    },
    {
      name: "core-must-not-depend-on-infrastructure",
      comment:
        "core は infrastructure に依存せず、依存方向を内側から外側へ保ちます。",
      severity: "error",
      from: { path: "^src/core/" },
      to: { path: "^src/infrastructure/" },
    },
    {
      name: "core-must-not-depend-on-presentation",
      comment: "core は presentation に依存しないようにします。",
      severity: "error",
      from: { path: "^src/core/" },
      to: { path: "^src/presentation/" },
    },
    {
      name: "core-must-not-depend-on-lib",
      comment: "core は外側の lib ヘルパーに依存しないようにします。",
      severity: "error",
      from: { path: "^src/core/" },
      to: { path: "^src/lib/" },
    },
    {
      name: "core-must-not-depend-on-schema",
      comment: "core は外側の schema に依存しないようにします。",
      severity: "error",
      from: { path: "^src/core/" },
      to: { path: "^src/schema/" },
    },
    {
      name: "infrastructure-must-not-depend-on-presentation",
      comment: "infrastructure は presentation に依存しないようにします。",
      severity: "error",
      from: { path: "^src/infrastructure/" },
      to: { path: "^src/presentation/" },
    },
  ],
  options: {
    baseDir: __dirname,
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
  },
};
