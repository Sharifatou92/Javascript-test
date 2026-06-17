const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["server.js"],
    },
  },
});
