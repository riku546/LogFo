/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "portfolio-must-not-depend-on-summary",
      comment:
        "feature 間で直接依存せず、shared layer に切り出す必要があることを確認します。",
      severity: "error",
      from: { path: "^src/features/portfolio/" },
      to: { path: "^src/features/summary/" },
    },
  ],
  options: {
    baseDir: __dirname,
    tsPreCompilationDeps: true,
  },
};
