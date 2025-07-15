import { defineConfig, devices } from "@playwright/test";

/**
 * Optimized Playwright configuration for CI/CD Pipeline
 * Focused on speed and stability for browser testing in CI environment
 */

export default defineConfig({
  testDir: "./tests/browser",

  // Run tests in parallel for better CI performance
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Minimal retries for CI - rely on test stability instead
  retries: process.env.CI ? 1 : 0,

  // Optimized worker configuration for CI
  workers: process.env.CI ? 2 : 1, // 2 workers for CI, 1 for local

  // Minimal reporter for CI speed
  reporter: [
    ["github"], // GitHub Actions reporter
    ["json", { outputFile: "test-results/ci-browser-test-results.json" }],
    ["junit", { outputFile: "test-results/ci-browser-test-results.xml" }],
  ],

  // Optimized settings for CI environment
  use: {
    // Base URL for all tests
    baseURL: "http://localhost:3000",

    // Minimal trace collection for CI
    trace: "retain-on-failure",

    // No screenshot for CI speed
    screenshot: "only-on-failure",

    // No video recording for CI
    video: "off",

    // Shorter timeout for CI
    actionTimeout: 8000,

    // Disable slow animations
    navigationTimeout: 10000,

    // Required headers for WebAssembly
    extraHTTPHeaders: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },

    // Disable auto-wait for better performance
    waitForTimeout: 5000,
  },

  // Only test essential browsers in CI
  projects: [
    {
      name: "chromium-ci",
      use: {
        ...devices["Desktop Chrome"],
        // Optimized Chrome args for CI
        launchOptions: {
          args: [
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-web-security",
            "--disable-blink-features=AutomationControlled",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=TranslateUI,VizDisplayCompositor",
            "--enable-features=WebAssemblySimd,WebAssemblyThreads",
            "--js-flags=--experimental-wasm-threads",
            "--memory-pressure-off",
            "--max_old_space_size=4096",
          ],
        },
        // Faster viewport
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Fast static server for CI
  webServer: {
    command: "node tests/browser/ci-server.cjs",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 20000, // 20 seconds timeout
    stdout: "pipe",
    stderr: "pipe",
  },

  // Shorter test timeout for CI
  timeout: 20000, // 20 seconds

  // Global setup optimized for CI
  globalSetup: "./tests/browser/ci-setup.ts",

  // Global teardown
  globalTeardown: "./tests/browser/ci-teardown.ts",

  // Optimized test fixtures
  expect: {
    // Shorter timeout for assertions
    timeout: 3000,

    // Disable screenshot comparison in CI
    toHaveScreenshot: {
      mode: "skip",
    },
  },

  // Output directory for test artifacts
  outputDir: "test-results/ci",

  // Only preserve failures to save space
  preserveOutput: "failures-only",

  // Test filtering for CI
  testMatch: [
    "**/tests/browser/**/*.ci.spec.ts",
    "**/tests/browser/**/*.fast.spec.ts",
    "**/tests/browser/critical/*.spec.ts",
  ],

  // Ignore slow tests in CI
  testIgnore: [
    "**/tests/browser/**/*.slow.spec.ts",
    "**/tests/browser/**/*.visual.spec.ts",
    "**/tests/browser/**/*.performance.spec.ts",
  ],

  // Metadata for CI
  metadata: {
    environment: "ci",
    testType: "browser",
    optimization: "speed",
  },
});