/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "core-must-not-depend-on-lib",
      comment: "core から lib への依存違反を検出できることを確認します。",
      severity: "error",
      from: { path: "^src/core/" },
      to: { path: "^src/lib/" },
    },
  ],
  options: {
    baseDir: __dirname,
    tsPreCompilationDeps: true,
  },
};
