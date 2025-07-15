# Testing Plugins

Comprehensive guide to testing DataPrism plugins. Learn how to write effective unit tests, integration tests, and performance tests for your plugins.

## Overview

Testing plugins ensures they work correctly, perform well, and integrate properly with DataPrism Core. This guide covers:

- Unit testing individual plugin methods
- Integration testing with DataPrism Core
- Performance and load testing
- Test data management
- Mocking and test utilities
- Continuous integration setup

## Test Setup

### Dependencies

```bash
npm install --save-dev @dataprism/testing jest @types/jest ts-jest
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"]
};
```

### Test Setup File

```typescript
// tests/setup.ts
import "@dataprism/testing/jest";

// Global test configuration
jest.setTimeout(30000);

// Mock external dependencies
jest.mock("external-api-client", () => ({
  ApiClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }))
}));
```

## Unit Testing

### Basic Plugin Testing

```typescript
// tests/my-plugin.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { MyPlugin } from "../src/my-plugin";
import { MockPluginContext } from "@dataprism/testing";

describe("MyPlugin", () => {
  let plugin: MyPlugin;
  let context: MockPluginContext;
  
  beforeEach(() => {
    plugin = new MyPlugin();
    context = new MockPluginContext();
  });
  
  describe("initialization", () => {
    it("should initialize successfully", async () => {
      await plugin.initialize(context);
      
      expect(plugin.name).toBe("my-plugin");
      expect(plugin.version).toBe("1.0.0");
      expect(context.getRegisteredActions()).toContain("process_data");
    });
    
    it("should fail initialization with invalid config", async () => {
      context.setConfig("myPlugin.apiUrl", "");
      
      await expect(plugin.initialize(context)).rejects.toThrow("API URL is required");
    });
  });
  
  describe("execute", () => {
    beforeEach(async () => {
      await plugin.initialize(context);
    });
    
    it("should process data correctly", async () => {
      const testData = [
        { id: 1, value: "test1" },
        { id: 2, value: "test2" }
      ];
      
      const result = await plugin.execute("process_data", {
        data: testData,
        options: { transform: true }
      });
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0].processed).toBe(true);
      expect(result.count).toBe(2);
    });
    
    it("should handle empty data", async () => {
      const result = await plugin.execute("process_data", {
        data: [],
        options: {}
      });
      
      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });
    
    it("should throw error for unknown action", async () => {
      await expect(plugin.execute("unknown_action", {})).rejects.toThrow(
        "Unknown action: unknown_action"
      );
    });
  });
  
  describe("dispose", () => {
    it("should cleanup resources", async () => {
      await plugin.initialize(context);
      
      const disposeSpy = jest.spyOn(plugin, "dispose");
      await plugin.dispose();
      
      expect(disposeSpy).toHaveBeenCalled();
    });
  });
});
```

### Testing with Mocks

```typescript
// tests/api-plugin.test.ts
import { ApiPlugin } from "../src/api-plugin";
import { MockPluginContext } from "@dataprism/testing";

describe("ApiPlugin", () => {
  let plugin: ApiPlugin;
  let context: MockPluginContext;
  let mockApiClient: jest.Mocked<any>;
  
  beforeEach(() => {
    plugin = new ApiPlugin();
    context = new MockPluginContext();
    
    // Mock the API client
    mockApiClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };
    
    // Inject mock into plugin
    (plugin as any).apiClient = mockApiClient;
  });
  
  it("should fetch data from API", async () => {
    const mockData = [{ id: 1, name: "Item 1" }];
    mockApiClient.get.mockResolvedValue({ data: mockData });
    
    await plugin.initialize(context);
    
    const result = await plugin.execute("fetch_data", {
      endpoint: "/items",
      filters: { active: true }
    });
    
    expect(mockApiClient.get).toHaveBeenCalledWith("/items", {
      params: { active: true }
    });
    expect(result.data).toEqual(mockData);
  });
  
  it("should handle API errors", async () => {
    mockApiClient.get.mockRejectedValue(new Error("API Error"));
    
    await plugin.initialize(context);
    
    await expect(plugin.execute("fetch_data", {
      endpoint: "/items"
    })).rejects.toThrow("API fetch failed: API Error");
  });
});
```

### Testing SQL Functions

```typescript
// tests/sql-functions.test.ts
import { SqlFunctionsPlugin } from "../src/sql-functions-plugin";
import { MockPluginContext } from "@dataprism/testing";

describe("SqlFunctionsPlugin", () => {
  let plugin: SqlFunctionsPlugin;
  let context: MockPluginContext;
  
  beforeEach(async () => {
    plugin = new SqlFunctionsPlugin();
    context = new MockPluginContext();
    await plugin.initialize(context);
  });
  
  it("should register custom SQL functions", () => {
    const registeredFunctions = context.getRegisteredSQLFunctions();
    
    expect(registeredFunctions).toContain("CUSTOM_TRANSFORM");
    expect(registeredFunctions).toContain("CUSTOM_VALIDATE");
  });
  
  it("should execute custom SQL function", () => {
    const transformFunction = context.getSQLFunction("CUSTOM_TRANSFORM");
    
    const result = transformFunction("hello world");
    
    expect(result).toBe("HELLO WORLD");
  });
  
  it("should handle SQL function errors", () => {
    const validateFunction = context.getSQLFunction("CUSTOM_VALIDATE");
    
    expect(() => validateFunction(null)).toThrow("Value cannot be null");
  });
});
```

## Integration Testing

### Testing with DataPrism Engine

```typescript
// tests/integration.test.ts
import { DataPrismEngine } from "@dataprism/core";
import { MyPlugin } from "../src/my-plugin";
import { createTestDatabase } from "@dataprism/testing";

describe("Plugin Integration", () => {
  let engine: DataPrismEngine;
  let plugin: MyPlugin;
  
  beforeEach(async () => {
    engine = new DataPrismEngine();
    plugin = new MyPlugin();
    
    await engine.initialize();
    await engine.registerPlugin(plugin);
  });
  
  afterEach(async () => {
    await engine.shutdown();
  });
  
  it("should integrate with engine", async () => {
    const testData = [
      { id: 1, name: "Item 1", value: 100 },
      { id: 2, name: "Item 2", value: 200 }
    ];
    
    // Load test data
    await engine.loadData(testData, "test_table");
    
    // Execute plugin action
    const result = await engine.executePlugin("my-plugin", "process_data", {
      tableName: "test_table",
      options: { transform: true }
    });
    
    expect(result.count).toBe(2);
    expect(result.data[0].processed).toBe(true);
  });
  
  it("should work with SQL queries", async () => {
    const testData = [
      { id: 1, text: "hello world" },
      { id: 2, text: "goodbye world" }
    ];
    
    await engine.loadData(testData, "test_table");
    
    // Use custom SQL function
    const result = await engine.query(`
      SELECT id, CUSTOM_TRANSFORM(text) as transformed_text
      FROM test_table
      ORDER BY id
    `);
    
    expect(result.data).toHaveLength(2);
    expect(result.data[0].transformed_text).toBe("HELLO WORLD");
    expect(result.data[1].transformed_text).toBe("GOODBYE WORLD");
  });
  
  it("should handle plugin errors gracefully", async () => {
    await expect(engine.executePlugin("my-plugin", "invalid_action", {})).rejects.toThrow(
      "Unknown action: invalid_action"
    );
  });
});
```

### Testing Data Sources

```typescript
// tests/data-source.test.ts
import { DataPrismEngine } from "@dataprism/core";
import { DataSourcePlugin } from "../src/data-source-plugin";
import { mockServer } from "@dataprism/testing";

describe("DataSourcePlugin Integration", () => {
  let engine: DataPrismEngine;
  let plugin: DataSourcePlugin;
  let server: any;
  
  beforeAll(async () => {
    server = mockServer.start(3001);
    server.get("/api/data", (req, res) => {
      res.json({
        data: [
          { id: 1, value: "test1" },
          { id: 2, value: "test2" }
        ]
      });
    });
  });
  
  afterAll(async () => {
    await server.stop();
  });
  
  beforeEach(async () => {
    engine = new DataPrismEngine();
    plugin = new DataSourcePlugin();
    
    await engine.initialize();
    await engine.registerPlugin(plugin);
  });
  
  afterEach(async () => {
    await engine.shutdown();
  });
  
  it("should fetch data from external source", async () => {
    const result = await engine.executePlugin("data-source", "fetch_data", {
      endpoint: "http://localhost:3001/api/data",
      tableName: "external_data"
    });
    
    expect(result.rowCount).toBe(2);
    
    // Verify data was loaded into table
    const queryResult = await engine.query("SELECT * FROM external_data");
    expect(queryResult.data).toHaveLength(2);
    expect(queryResult.data[0].value).toBe("test1");
  });
});
```

## Performance Testing

### Load Testing

```typescript
// tests/performance.test.ts
import { DataPrismEngine } from "@dataprism/core";
import { MyPlugin } from "../src/my-plugin";
import { generateTestData } from "@dataprism/testing";

describe("Plugin Performance", () => {
  let engine: DataPrismEngine;
  let plugin: MyPlugin;
  
  beforeEach(async () => {
    engine = new DataPrismEngine();
    plugin = new MyPlugin();
    
    await engine.initialize();
    await engine.registerPlugin(plugin);
  });
  
  afterEach(async () => {
    await engine.shutdown();
  });
  
  it("should handle large datasets efficiently", async () => {
    const largeDataset = generateTestData(100000); // 100k rows
    
    const startTime = Date.now();
    
    const result = await engine.executePlugin("my-plugin", "process_data", {
      data: largeDataset,
      options: { transform: true }
    });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    expect(result.count).toBe(100000);
    expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
  });
  
  it("should handle memory efficiently", async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Process multiple datasets
    for (let i = 0; i < 10; i++) {
      const dataset = generateTestData(10000);
      await engine.executePlugin("my-plugin", "process_data", {
        data: dataset,
        options: { transform: true }
      });
    }
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
  });
  
  it("should handle concurrent requests", async () => {
    const testData = generateTestData(1000);
    const concurrentRequests = 20;
    
    const startTime = Date.now();
    
    // Execute multiple concurrent requests
    const promises = Array.from({ length: concurrentRequests }, () =>
      engine.executePlugin("my-plugin", "process_data", {
        data: testData,
        options: { transform: true }
      })
    );
    
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // All requests should complete successfully
    expect(results).toHaveLength(concurrentRequests);
    results.forEach(result => {
      expect(result.count).toBe(1000);
    });
    
    // Should handle concurrency efficiently
    expect(totalTime).toBeLessThan(10000); // Within 10 seconds
  });
});
```

### Benchmarking

```typescript
// tests/benchmark.test.ts
import { benchmark } from "@dataprism/testing";
import { MyPlugin } from "../src/my-plugin";
import { MockPluginContext } from "@dataprism/testing";

describe("Plugin Benchmarks", () => {
  let plugin: MyPlugin;
  let context: MockPluginContext;
  
  beforeEach(async () => {
    plugin = new MyPlugin();
    context = new MockPluginContext();
    await plugin.initialize(context);
  });
  
  it("should benchmark data processing", async () => {
    const testData = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: `test${i}`
    }));
    
    const results = await benchmark({
      name: "process_data",
      iterations: 100,
      setup: () => ({ data: testData, options: { transform: true } }),
      test: (params) => plugin.execute("process_data", params)
    });
    
    console.log("Benchmark Results:", results);
    
    expect(results.averageTime).toBeLessThan(100); // Less than 100ms average
    expect(results.throughput).toBeGreaterThan(1000); // More than 1000 ops/sec
  });
});
```

## Test Data Management

### Test Data Generators

```typescript
// tests/helpers/test-data.ts
export function generateSalesData(count: number): any[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    product: `Product ${i % 10 + 1}`,
    amount: Math.floor(Math.random() * 1000) + 100,
    date: new Date(2024, 0, 1 + i % 365).toISOString().split("T")[0],
    region: ["North", "South", "East", "West"][i % 4]
  }));
}

export function generateCustomerData(count: number): any[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    age: Math.floor(Math.random() * 50) + 20,
    city: ["New York", "Los Angeles", "Chicago", "Houston"][i % 4],
    joinDate: new Date(2020 + (i % 4), i % 12, 1).toISOString().split("T")[0]
  }));
}

export function generateTimeSeriesData(count: number): any[] {
  const startDate = new Date(2024, 0, 1);
  
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().split("T")[0],
      value: Math.sin(i * 0.1) * 100 + Math.random() * 20,
      category: ["A", "B", "C"][i % 3]
    };
  });
}
```

### Test Database Setup

```typescript
// tests/helpers/test-db.ts
import { DataPrismEngine } from "@dataprism/core";
import { generateSalesData, generateCustomerData } from "./test-data";

export async function setupTestDatabase(engine: DataPrismEngine): Promise<void> {
  // Create test tables with sample data
  const salesData = generateSalesData(1000);
  const customerData = generateCustomerData(100);
  
  await engine.loadData(salesData, "sales");
  await engine.loadData(customerData, "customers");
  
  // Create indexes for better performance
  await engine.query("CREATE INDEX idx_sales_date ON sales(date)");
  await engine.query("CREATE INDEX idx_sales_product ON sales(product)");
  await engine.query("CREATE INDEX idx_customers_city ON customers(city)");
}

export async function cleanupTestDatabase(engine: DataPrismEngine): Promise<void> {
  // Drop test tables
  await engine.query("DROP TABLE IF EXISTS sales");
  await engine.query("DROP TABLE IF EXISTS customers");
}
```

## Visualization Testing

### DOM Testing

```typescript
// tests/visualization.test.ts
import { JSDOM } from "jsdom";
import { VisualizationPlugin } from "../src/visualization-plugin";
import { MockPluginContext } from "@dataprism/testing";

describe("VisualizationPlugin", () => {
  let plugin: VisualizationPlugin;
  let context: MockPluginContext;
  let dom: JSDOM;
  
  beforeEach(async () => {
    // Setup DOM environment
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.document = dom.window.document;
    global.window = dom.window as any;
    
    plugin = new VisualizationPlugin();
    context = new MockPluginContext();
    await plugin.initialize(context);
  });
  
  afterEach(() => {
    dom.window.close();
  });
  
  it("should create chart element", async () => {
    const testData = [
      { category: "A", value: 100 },
      { category: "B", value: 200 },
      { category: "C", value: 150 }
    ];
    
    const chartElement = await plugin.execute("create_chart", {
      type: "bar",
      data: testData,
      config: { width: 400, height: 300 }
    });
    
    expect(chartElement).toBeInstanceOf(dom.window.HTMLElement);
    expect(chartElement.className).toBe("chart-container");
    
    // Check if canvas was created
    const canvas = chartElement.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.width).toBe(400);
    expect(canvas?.height).toBe(300);
  });
  
  it("should handle chart updates", async () => {
    const initialData = [{ category: "A", value: 100 }];
    const updatedData = [{ category: "A", value: 150 }];
    
    const chartElement = await plugin.execute("create_chart", {
      type: "bar",
      data: initialData,
      config: {}
    });
    
    await plugin.execute("update_chart", {
      chart: chartElement,
      data: updatedData
    });
    
    // Verify chart was updated
    expect(chartElement.dataset.lastUpdate).toBeDefined();
  });
});
```

### Visual Regression Testing

```typescript
// tests/visual-regression.test.ts
import puppeteer from "puppeteer";
import { VisualizationPlugin } from "../src/visualization-plugin";
import { compareImages } from "@dataprism/testing";

describe("Visual Regression", () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  it("should render chart correctly", async () => {
    const testData = [
      { category: "A", value: 100 },
      { category: "B", value: 200 },
      { category: "C", value: 150 }
    ];
    
    // Create test page with chart
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Chart Test</title>
        <style>
          .chart-container { width: 400px; height: 300px; }
        </style>
      </head>
      <body>
        <div id="chart-container"></div>
        <script>
          // Plugin code here
        </script>
      </body>
      </html>
    `);
    
    // Take screenshot
    const screenshot = await page.screenshot({
      clip: { x: 0, y: 0, width: 400, height: 300 }
    });
    
    // Compare with baseline
    const baselineImage = "tests/baselines/bar-chart.png";
    const comparisonResult = await compareImages(screenshot, baselineImage);
    
    expect(comparisonResult.similarity).toBeGreaterThan(0.95);
  });
});
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Plugin

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
        dataprism-version: ["^1.0.0", "^1.1.0"]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install DataPrism Core
      run: npm install @dataprism/core@${{ matrix.dataprism-version }}
    
    - name: Run linter
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

### Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:performance": "jest --testPathPattern=tests/performance",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

## Best Practices

### Test Organization

```
tests/
├── unit/
│   ├── plugin.test.ts
│   ├── utils.test.ts
│   └── validators.test.ts
├── integration/
│   ├── engine-integration.test.ts
│   └── plugin-interaction.test.ts
├── performance/
│   ├── load-test.test.ts
│   └── benchmark.test.ts
├── e2e/
│   ├── full-workflow.test.ts
│   └── ui-integration.test.ts
├── helpers/
│   ├── test-data.ts
│   ├── mocks.ts
│   └── assertions.ts
└── fixtures/
    ├── sample-data.json
    └── test-config.json
```

### Testing Guidelines

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Clear Naming**: Use descriptive test names that explain what is being tested
3. **AAA Pattern**: Arrange, Act, Assert - structure tests clearly
4. **Edge Cases**: Test boundary conditions and error scenarios
5. **Performance**: Include performance tests for critical operations
6. **Mocking**: Use mocks for external dependencies
7. **Coverage**: Aim for high test coverage but focus on quality over quantity

### Custom Assertions

```typescript
// tests/helpers/assertions.ts
export function expectValidPluginResult(result: any): void {
  expect(result).toBeDefined();
  expect(typeof result).toBe("object");
  expect(result).toHaveProperty("data");
  expect(Array.isArray(result.data)).toBe(true);
}

export function expectValidChartElement(element: HTMLElement): void {
  expect(element).toBeInstanceOf(HTMLElement);
  expect(element.className).toContain("chart");
  expect(element.children.length).toBeGreaterThan(0);
}

export function expectPerformanceWithinLimits(executionTime: number, memoryUsage: number): void {
  expect(executionTime).toBeLessThan(5000); // 5 seconds
  expect(memoryUsage).toBeLessThan(100 * 1024 * 1024); // 100MB
}
```

## Debugging Tests

### Debug Configuration

```typescript
// tests/debug.test.ts
import { DataPrismEngine } from "@dataprism/core";
import { MyPlugin } from "../src/my-plugin";

// Enable debug mode
process.env.DEBUG = "dataprism:*";

describe("Debug Tests", () => {
  it("should debug plugin execution", async () => {
    const engine = new DataPrismEngine({
      debug: true,
      logLevel: "debug"
    });
    
    const plugin = new MyPlugin();
    await engine.registerPlugin(plugin);
    
    // Add breakpoints and debug statements
    const result = await engine.executePlugin("my-plugin", "process_data", {
      data: [{ id: 1, value: "test" }]
    });
    
    console.log("Debug result:", result);
  });
});
```

### Test Debugging Tips

1. **Use console.log strategically**: Add temporary logging to understand test flow
2. **Use debugger statements**: Set breakpoints in tests and plugin code
3. **Run single tests**: Use `fit` or `fdescribe` to focus on specific tests
4. **Check test output**: Review console output and error messages
5. **Use test debugging tools**: Leverage IDE debugging features

## Examples

See the [Plugin Examples](/examples/plugins) page for complete working examples of tested plugins.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.
