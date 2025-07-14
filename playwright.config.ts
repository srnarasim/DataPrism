import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for DataPrism Core browser testing
 * Tests WebAssembly functionality across different browsers
 */

export default defineConfig({
  testDir: "./tests/browser",

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/browser-test-results.json" }],
    ["junit", { outputFile: "test-results/browser-test-results.xml" }],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for all tests
    baseURL: "http://localhost:3000",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Take screenshot on failure
    screenshot: "only-on-failure",

    // Record video on failure
    video: "retain-on-failure",

    // Global test timeout
    actionTimeout: 10000,

    // Required headers for WebAssembly
    extraHTTPHeaders: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },

  // Configure projects for major browsers
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

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        // Firefox-specific WebAssembly configuration
        launchOptions: {
          firefoxUserPrefs: {
            "javascript.options.wasm_simd": true,
            "javascript.options.wasm_multi_memory": true,
          },
        },
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        // Safari has limited WebAssembly threading support
      },
    },

    // Mobile testing
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        launchOptions: {
          args: [
            "--enable-features=WebAssemblySimd",
            "--enable-experimental-web-platform-features",
          ],
        },
      },
    },

    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    // Microsoft Edge
    {
      name: "Microsoft Edge",
      use: {
        ...devices["Desktop Edge"],
        channel: "msedge",
        launchOptions: {
          args: [
            "--enable-features=WebAssemblySimd,WebAssemblyThreads",
            "--enable-experimental-web-platform-features",
          ],
        },
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: process.env.CI ? {
    // Use static server in CI to avoid demo app dependency issues
    command: "node tests/browser/static-server.cjs",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 30 * 1000, // 30 seconds for static server
  } : {
    // Use demo app locally for full integration testing
    command: "npm run dev:demo",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000, // 2 minutes for WebAssembly to load
  },

  // Test timeout
  timeout: 30 * 1000, // 30 seconds

  // Global setup
  globalSetup: "./tests/browser/global-setup.ts",

  // Global teardown
  globalTeardown: "./tests/browser/global-teardown.ts",

  // Test fixtures
  expect: {
    // Default timeout for assertions
    timeout: 5000,

    // Custom matchers
    toHaveScreenshot: {
      // Screenshot comparison options
      threshold: 0.2,
      mode: "exact",
    },
  },

  // Output directory for test artifacts
  outputDir: "test-results",

  // Preserve output directory
  preserveOutput: "failures-only",
});
