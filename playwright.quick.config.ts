import { defineConfig, devices } from "@playwright/test";

/**
 * Quick Playwright configuration for DataPrism Core browser testing
 * Runs only essential tests on Chromium for faster development feedback
 */

export default defineConfig({
  testDir: "./tests/browser",

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // No retries for quick tests
  retries: 0,

  // Single worker for quick tests
  workers: 1,

  // Minimal reporter for quick feedback
  reporter: [
    ["line"],
    ["json", { outputFile: "test-results/quick-browser-test-results.json" }],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for all tests
    baseURL: "http://localhost:3000",

    // Minimal trace collection
    trace: "retain-on-failure",

    // Take screenshot on failure only
    screenshot: "only-on-failure",

    // No video recording for quick tests
    video: "off",

    // Shorter timeout for quick tests
    actionTimeout: 5000,

    // Required headers for WebAssembly
    extraHTTPHeaders: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },

  // Only test Chromium for quick tests
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Enable WebAssembly SIMD and threading
        launchOptions: {
          args: [
            "--enable-features=WebAssemblySimd,WebAssemblyThreads",
            "--enable-experimental-web-platform-features",
            "--js-flags=--experimental-wasm-threads",
          ],
        },
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    // Use static server for quick tests
    command: "node tests/browser/static-server.cjs",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 15 * 1000, // 15 seconds for quick startup
  },

  // Shorter test timeout for quick tests
  timeout: 15 * 1000, // 15 seconds

  // Test fixtures
  expect: {
    // Shorter timeout for assertions
    timeout: 3000,
  },

  // Output directory for test artifacts
  outputDir: "test-results/quick",

  // Preserve output directory
  preserveOutput: "failures-only",
});