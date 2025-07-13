import { chromium, FullConfig } from "@playwright/test";

/**
 * Global setup for Playwright tests
 * Performs one-time setup before all tests run
 */

async function globalSetup(config: FullConfig) {
  console.log("🔧 Setting up global test environment...");

  // Launch a browser to check WebAssembly support
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Check WebAssembly support
    const wasmSupported = await page.evaluate(() => {
      return (
        typeof WebAssembly !== "undefined" &&
        typeof WebAssembly.instantiate === "function" &&
        typeof WebAssembly.Module === "function"
      );
    });

    if (!wasmSupported) {
      console.error("❌ WebAssembly not supported in test browser");
      throw new Error("WebAssembly support required for DataPrism Core tests");
    }

    console.log("✅ WebAssembly support confirmed");

    // Check for SharedArrayBuffer support (required for threading)
    const sharedArrayBufferSupported = await page.evaluate(() => {
      return typeof SharedArrayBuffer !== "undefined";
    });

    if (sharedArrayBufferSupported) {
      console.log("✅ SharedArrayBuffer support confirmed");
    } else {
      console.log(
        "⚠️  SharedArrayBuffer not supported - threading features will be limited",
      );
    }

    // Test basic WASM instantiation
    const wasmInstantiationWorks = await page.evaluate(async () => {
      try {
        // Simple WASM module that exports a function returning 42
        const wasmCode = new Uint8Array([
          0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01,
          0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07,
          0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01,
          0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,
        ]);

        const module = await WebAssembly.instantiate(wasmCode);
        const result = (module.instance.exports.add as Function)(20, 22);
        return result === 42;
      } catch (error) {
        console.error("WASM instantiation test failed:", error);
        return false;
      }
    });

    if (!wasmInstantiationWorks) {
      console.error("❌ WebAssembly instantiation test failed");
      throw new Error("WebAssembly instantiation not working properly");
    }

    console.log("✅ WebAssembly instantiation test passed");

    // Test fetch API (required for loading WASM files)
    const fetchSupported = await page.evaluate(() => {
      return typeof fetch !== "undefined";
    });

    if (!fetchSupported) {
      console.error("❌ Fetch API not supported");
      throw new Error("Fetch API required for loading WASM modules");
    }

    console.log("✅ Fetch API support confirmed");
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  // Set up test data directory
  const fs = await import("fs/promises");
  const path = await import("path");

  const testDataDir = path.join(process.cwd(), "test-results");
  await fs.mkdir(testDataDir, { recursive: true });

  console.log("✅ Test data directory created");

  // Create test artifacts directory
  const artifactsDir = path.join(testDataDir, "artifacts");
  await fs.mkdir(artifactsDir, { recursive: true });

  console.log("✅ Test artifacts directory created");

  console.log("🎉 Global setup completed successfully");
}

export default globalSetup;
