import { test, expect } from "@playwright/test";

/**
 * Browser tests for DataPrism Core WebAssembly functionality
 * Tests core engine initialization and basic operations across browsers
 */

test.describe("DataPrism Core Engine", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo application
    await page.goto("/");

    // Wait for the DataPrism engine to initialize
    await page.waitForSelector('[data-testid="engine-status"]', {
      timeout: 30000,
    });

    // Check that the engine is ready
    const status = await page.textContent('[data-testid="engine-status"]');
    expect(status).toContain("Engine Ready");
  });

  test("should initialize WebAssembly engine successfully", async ({
    page,
  }) => {
    // Verify WebAssembly support
    const wasmSupported = await page.evaluate(() => {
      return (
        typeof WebAssembly !== "undefined" &&
        typeof WebAssembly.instantiate === "function"
      );
    });
    expect(wasmSupported).toBeTruthy();

    // Verify DataPrism engine is available
    const engineAvailable = await page.evaluate(() => {
      return typeof (window as any).DataPrismEngine !== "undefined";
    });
    expect(engineAvailable).toBeTruthy();
  });

  test("should load and query sample data", async ({ page }) => {
    // Click on the Data Explorer
    await page.click('a[href="/explorer"]');

    // Wait for the data explorer to load
    await page.waitForSelector('[data-testid="data-explorer"]');

    // Check that sample data is loaded
    const tableCount = await page.textContent('[data-testid="table-count"]');
    expect(parseInt(tableCount || "0")).toBeGreaterThan(0);

    // Run a simple query
    await page.click('[data-testid="run-sample-query"]');

    // Wait for query results
    await page.waitForSelector('[data-testid="query-results"]');

    // Verify results are displayed
    const resultsTable = page.locator('[data-testid="query-results"] table');
    await expect(resultsTable).toBeVisible();

    const rowCount = await resultsTable.locator("tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should handle CSV file upload", async ({ page }) => {
    await page.goto("/explorer");

    // Create a test CSV file
    const csvContent = `name,age,city
Alice,25,New York
Bob,30,London
Charlie,35,Tokyo`;

    // Upload CSV file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test-data.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    // Wait for upload to complete
    await page.waitForSelector('[data-testid="upload-success"]');

    // Verify the data was loaded
    const uploadedTableName = await page.textContent(
      '[data-testid="uploaded-table-name"]',
    );
    expect(uploadedTableName).toBeTruthy();
  });

  test("should display performance metrics", async ({ page }) => {
    await page.goto("/performance");

    // Wait for metrics to load
    await page.waitForSelector('[data-testid="performance-metrics"]');

    // Check memory usage metric
    const memoryUsage = page.locator('[data-testid="memory-usage"]');
    await expect(memoryUsage).toBeVisible();

    const memoryValue = await memoryUsage.textContent();
    expect(memoryValue).toMatch(/\d+(\.\d+)?\s*MB/);

    // Check query count metric
    const queryCount = page.locator('[data-testid="query-count"]');
    await expect(queryCount).toBeVisible();

    const queryValue = await queryCount.textContent();
    expect(parseInt(queryValue || "0")).toBeGreaterThanOrEqual(0);
  });
});
