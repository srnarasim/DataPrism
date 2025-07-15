# Plugin Development Guide

This guide covers everything you need to know to create custom plugins for DataPrism Core. Learn how to extend the platform with your own data processors, visualizations, and integrations.

## Overview

DataPrism plugins are modular extensions that can:
- Process and transform data
- Create custom visualizations
- Integrate with external services
- Add new query capabilities
- Provide utility functions

## Plugin Architecture

Plugins in DataPrism follow a standardized architecture:

```typescript
interface DataPrismPlugin {
  name: string;
  version: string;
  description: string;
  capabilities: PluginCapability[];
  initialize(context: PluginContext): Promise<void>;
  execute(action: string, params: any): Promise<any>;
  dispose(): Promise<void>;
}
```

## Creating Your First Plugin

### Plugin Template

```typescript
import { DataPrismPlugin, PluginContext, PluginCapability } from "@dataprism/core";

export class MyCustomPlugin implements DataPrismPlugin {
  name = "my-custom-plugin";
  version = "1.0.0";
  description = "A custom plugin for DataPrism";
  capabilities: PluginCapability[] = ["data_processing", "visualization"];
  
  private context: PluginContext;
  
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    // Register plugin actions
    this.context.registerAction("process_data", this.processData.bind(this));
    this.context.registerAction("create_chart", this.createChart.bind(this));
    
    console.log(`${this.name} v${this.version} initialized`);
  }
  
  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case "process_data":
        return this.processData(params);
      case "create_chart":
        return this.createChart(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  private async processData(params: any): Promise<any> {
    // Custom data processing logic
    const { data, options } = params;
    
    // Process the data
    const processedData = data.map(row => {
      // Apply custom transformations
      return { ...row, processed: true };
    });
    
    return { data: processedData, count: processedData.length };
  }
  
  private async createChart(params: any): Promise<HTMLElement> {
    // Custom visualization logic
    const { data, config } = params;
    
    const chartElement = document.createElement("div");
    chartElement.className = "custom-chart";
    
    // Create your visualization
    // ... chart implementation
    
    return chartElement;
  }
  
  async dispose(): Promise<void> {
    // Cleanup resources
    console.log(`${this.name} disposed`);
  }
}

// Factory function
export function createMyCustomPlugin(): MyCustomPlugin {
  return new MyCustomPlugin();
}
```

### Plugin Registration

```typescript
import { DataPrismEngine } from "@dataprism/core";
import { createMyCustomPlugin } from "./my-custom-plugin";

const engine = new DataPrismEngine();
const plugin = createMyCustomPlugin();

// Register the plugin
engine.registerPlugin(plugin);

// Use the plugin
const result = await engine.executePlugin("my-custom-plugin", "process_data", {
  data: myData,
  options: { transform: true }
});
```

## Plugin Types

### Data Processing Plugins

```typescript
export class DataProcessorPlugin implements DataPrismPlugin {
  name = "data-processor";
  version = "1.0.0";
  description = "Custom data processing plugin";
  capabilities = ["data_processing"];
  
  async initialize(context: PluginContext): Promise<void> {
    // Register SQL functions
    context.registerSQLFunction("CUSTOM_TRANSFORM", this.customTransform);
    
    // Register data transformers
    context.registerTransformer("custom_format", this.customFormat);
  }
  
  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case "transform":
        return this.transform(params);
      case "validate":
        return this.validate(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  private async transform(params: any): Promise<any> {
    const { data, rules } = params;
    
    return data.map(row => {
      let transformed = { ...row };
      
      rules.forEach(rule => {
        transformed = this.applyRule(transformed, rule);
      });
      
      return transformed;
    });
  }
  
  private async validate(params: any): Promise<any> {
    const { data, schema } = params;
    const errors = [];
    
    data.forEach((row, index) => {
      const rowErrors = this.validateRow(row, schema);
      if (rowErrors.length > 0) {
        errors.push({ row: index, errors: rowErrors });
      }
    });
    
    return { valid: errors.length === 0, errors };
  }
  
  private customTransform(value: any): any {
    // Custom SQL function implementation
    return value.toString().toUpperCase();
  }
  
  private customFormat(data: any[]): any[] {
    // Custom data formatter
    return data.map(row => ({ ...row, formatted: true }));
  }
  
  private applyRule(row: any, rule: any): any {
    // Apply transformation rule
    return row;
  }
  
  private validateRow(row: any, schema: any): string[] {
    // Validate row against schema
    return [];
  }
  
  async dispose(): Promise<void> {
    // Cleanup
  }
}
```

### Visualization Plugins

```typescript
export class VisualizationPlugin implements DataPrismPlugin {
  name = "custom-visualization";
  version = "1.0.0";
  description = "Custom visualization plugin";
  capabilities = ["visualization"];
  
  async initialize(context: PluginContext): Promise<void> {
    // Register chart types
    context.registerChartType("custom_chart", this.createCustomChart);
    
    // Load required libraries
    await this.loadDependencies();
  }
  
  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case "create_chart":
        return this.createChart(params);
      case "update_chart":
        return this.updateChart(params);
      case "export_chart":
        return this.exportChart(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  private async createChart(params: any): Promise<HTMLElement> {
    const { type, data, config } = params;
    
    const container = document.createElement("div");
    container.className = "custom-chart-container";
    
    switch (type) {
      case "custom_chart":
        return this.createCustomChart(container, data, config);
      default:
        throw new Error(`Unknown chart type: ${type}`);
    }
  }
  
  private async createCustomChart(container: HTMLElement, data: any[], config: any): Promise<HTMLElement> {
    // Create custom chart implementation
    const canvas = document.createElement("canvas");
    canvas.width = config.width || 800;
    canvas.height = config.height || 600;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");
    
    // Custom drawing logic
    this.drawChart(ctx, data, config);
    
    container.appendChild(canvas);
    return container;
  }
  
  private drawChart(ctx: CanvasRenderingContext2D, data: any[], config: any): void {
    // Custom chart drawing implementation
    ctx.fillStyle = config.color || "#333";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw data points, bars, lines, etc.
    data.forEach((point, index) => {
      // Custom drawing logic for each data point
    });
  }
  
  private async updateChart(params: any): Promise<void> {
    // Update existing chart with new data
    const { chart, data } = params;
    // Update implementation
  }
  
  private async exportChart(params: any): Promise<Blob> {
    // Export chart as image or PDF
    const { chart, format } = params;
    
    if (format === "png") {
      const canvas = chart.querySelector("canvas");
      return new Promise(resolve => {
        canvas.toBlob(resolve, "image/png");
      });
    }
    
    throw new Error(`Unsupported export format: ${format}`);
  }
  
  private async loadDependencies(): Promise<void> {
    // Load external libraries if needed
    // await loadScript("https://d3js.org/d3.v7.min.js");
  }
  
  async dispose(): Promise<void> {
    // Cleanup
  }
}
```

### Integration Plugins

```typescript
export class IntegrationPlugin implements DataPrismPlugin {
  name = "api-integration";
  version = "1.0.0";
  description = "External API integration plugin";
  capabilities = ["data_source", "data_export"];
  
  private apiClient: any;
  
  async initialize(context: PluginContext): Promise<void> {
    // Initialize API client
    this.apiClient = new APIClient({
      baseUrl: context.getConfig("api.baseUrl"),
      apiKey: context.getConfig("api.key")
    });
    
    // Register data sources
    context.registerDataSource("external_api", this.fetchFromAPI.bind(this));
  }
  
  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case "fetch_data":
        return this.fetchData(params);
      case "export_data":
        return this.exportData(params);
      case "sync_data":
        return this.syncData(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  private async fetchData(params: any): Promise<any> {
    const { endpoint, filters, pagination } = params;
    
    try {
      const response = await this.apiClient.get(endpoint, {
        params: { ...filters, ...pagination }
      });
      
      return {
        data: response.data,
        totalCount: response.totalCount,
        hasMore: response.hasMore
      };
    } catch (error) {
      throw new Error(`API fetch failed: ${error.message}`);
    }
  }
  
  private async exportData(params: any): Promise<any> {
    const { data, destination, format } = params;
    
    try {
      const response = await this.apiClient.post(destination, {
        data: data,
        format: format
      });
      
      return {
        success: true,
        exportId: response.exportId,
        url: response.url
      };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }
  
  private async syncData(params: any): Promise<any> {
    const { tableName, syncConfig } = params;
    
    // Implement bidirectional sync logic
    const localData = await this.context.getTableData(tableName);
    const remoteData = await this.fetchFromAPI(syncConfig.endpoint);
    
    // Merge and sync data
    const mergedData = this.mergeData(localData, remoteData, syncConfig.mergeStrategy);
    
    // Update local table
    await this.context.updateTable(tableName, mergedData);
    
    return {
      synced: true,
      localCount: localData.length,
      remoteCount: remoteData.length,
      finalCount: mergedData.length
    };
  }
  
  private async fetchFromAPI(endpoint: string): Promise<any[]> {
    // Fetch data from external API
    const response = await this.apiClient.get(endpoint);
    return response.data;
  }
  
  private mergeData(local: any[], remote: any[], strategy: string): any[] {
    // Implement data merge logic based on strategy
    switch (strategy) {
      case "replace":
        return remote;
      case "merge":
        return [...local, ...remote];
      case "upsert":
        // Implement upsert logic
        return remote;
      default:
        return remote;
    }
  }
  
  async dispose(): Promise<void> {
    // Cleanup API connections
    if (this.apiClient) {
      await this.apiClient.disconnect();
    }
  }
}
```

## Plugin Context API

The plugin context provides access to DataPrism's core functionality:

```typescript
interface PluginContext {
  // Configuration
  getConfig(key: string): any;
  setConfig(key: string, value: any): void;
  
  // Data access
  getTableData(tableName: string): Promise<any[]>;
  updateTable(tableName: string, data: any[]): Promise<void>;
  executeQuery(sql: string): Promise<QueryResult>;
  
  // Registration
  registerAction(name: string, handler: Function): void;
  registerSQLFunction(name: string, handler: Function): void;
  registerChartType(name: string, handler: Function): void;
  registerDataSource(name: string, handler: Function): void;
  
  // Events
  on(event: string, handler: Function): void;
  emit(event: string, data: any): void;
  
  // Logging
  log(message: string, level?: string): void;
  
  // Storage
  getStorage(key: string): Promise<any>;
  setStorage(key: string, value: any): Promise<void>;
}
```

## Plugin Capabilities

Plugins can declare their capabilities:

```typescript
type PluginCapability = 
  | "data_processing"    // Data transformation and processing
  | "visualization"      // Chart and visualization creation
  | "data_source"        // External data source integration
  | "data_export"        // Data export functionality
  | "query_extension"    // SQL query extensions
  | "utility"            // Utility functions
  | "monitoring"         // Performance and monitoring
  | "security"           // Security and authentication
  | "ai_ml"              // AI and machine learning
  | "streaming"          // Real-time data streaming
```

## Configuration and Settings

### Plugin Configuration

```typescript
export class ConfigurablePlugin implements DataPrismPlugin {
  name = "configurable-plugin";
  version = "1.0.0";
  description = "A plugin with configuration options";
  capabilities = ["data_processing"];
  
  private config: any;
  
  async initialize(context: PluginContext): Promise<void> {
    // Load configuration
    this.config = {
      apiUrl: context.getConfig("configurablePlugin.apiUrl") || "https://api.example.com",
      timeout: context.getConfig("configurablePlugin.timeout") || 5000,
      retries: context.getConfig("configurablePlugin.retries") || 3,
      enableCache: context.getConfig("configurablePlugin.enableCache") ?? true
    };
    
    // Validate configuration
    this.validateConfig();
  }
  
  private validateConfig(): void {
    if (!this.config.apiUrl) {
      throw new Error("API URL is required");
    }
    
    if (this.config.timeout < 1000) {
      throw new Error("Timeout must be at least 1000ms");
    }
  }
  
  async execute(action: string, params: any): Promise<any> {
    // Implementation using this.config
    return {};
  }
  
  async dispose(): Promise<void> {
    // Cleanup
  }
}
```

### Plugin Settings Schema

```typescript
// Define settings schema for UI generation
export const pluginSettingsSchema = {
  type: "object",
  properties: {
    apiUrl: {
      type: "string",
      title: "API URL",
      description: "Base URL for the external API",
      default: "https://api.example.com"
    },
    timeout: {
      type: "number",
      title: "Request Timeout",
      description: "Request timeout in milliseconds",
      default: 5000,
      minimum: 1000
    },
    enableCache: {
      type: "boolean",
      title: "Enable Caching",
      description: "Enable response caching for better performance",
      default: true
    }
  },
  required: ["apiUrl"]
};
```

## Testing Plugins

### Unit Testing

```typescript
import { describe, it, expect, beforeEach } from "@jest/globals";
import { MyCustomPlugin } from "./my-custom-plugin";
import { MockPluginContext } from "@dataprism/testing";

describe("MyCustomPlugin", () => {
  let plugin: MyCustomPlugin;
  let context: MockPluginContext;
  
  beforeEach(() => {
    plugin = new MyCustomPlugin();
    context = new MockPluginContext();
  });
  
  it("should initialize successfully", async () => {
    await plugin.initialize(context);
    expect(plugin.name).toBe("my-custom-plugin");
  });
  
  it("should process data correctly", async () => {
    await plugin.initialize(context);
    
    const result = await plugin.execute("process_data", {
      data: [{ id: 1, value: "test" }],
      options: { transform: true }
    });
    
    expect(result.data).toHaveLength(1);
    expect(result.data[0].processed).toBe(true);
  });
  
  it("should handle errors gracefully", async () => {
    await plugin.initialize(context);
    
    await expect(plugin.execute("invalid_action", {})).rejects.toThrow("Unknown action: invalid_action");
  });
});
```

### Integration Testing

```typescript
import { DataPrismEngine } from "@dataprism/core";
import { createMyCustomPlugin } from "./my-custom-plugin";

describe("Plugin Integration", () => {
  let engine: DataPrismEngine;
  let plugin: MyCustomPlugin;
  
  beforeEach(async () => {
    engine = new DataPrismEngine();
    plugin = createMyCustomPlugin();
    await engine.registerPlugin(plugin);
  });
  
  it("should integrate with engine", async () => {
    const testData = [{ id: 1, value: "test" }];
    
    const result = await engine.executePlugin("my-custom-plugin", "process_data", {
      data: testData,
      options: { transform: true }
    });
    
    expect(result.data).toHaveLength(1);
    expect(result.data[0].processed).toBe(true);
  });
});
```

## Best Practices

### Error Handling

```typescript
export class RobustPlugin implements DataPrismPlugin {
  async execute(action: string, params: any): Promise<any> {
    try {
      // Plugin logic
      return await this.performAction(action, params);
    } catch (error) {
      // Log error
      this.context.log(`Plugin error: ${error.message}`, "error");
      
      // Emit error event
      this.context.emit("plugin_error", {
        plugin: this.name,
        action,
        error: error.message
      });
      
      // Re-throw or return error response
      throw new PluginError(`${this.name}: ${error.message}`, error);
    }
  }
}
```

### Performance Optimization

```typescript
export class OptimizedPlugin implements DataPrismPlugin {
  private cache = new Map();
  
  async execute(action: string, params: any): Promise<any> {
    // Check cache first
    const cacheKey = this.getCacheKey(action, params);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Process in batches for large datasets
    if (params.data && params.data.length > 10000) {
      return this.processBatches(action, params);
    }
    
    // Normal processing
    const result = await this.performAction(action, params);
    
    // Cache result
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  private async processBatches(action: string, params: any): Promise<any> {
    const batchSize = 1000;
    const results = [];
    
    for (let i = 0; i < params.data.length; i += batchSize) {
      const batch = params.data.slice(i, i + batchSize);
      const batchResult = await this.performAction(action, { ...params, data: batch });
      results.push(batchResult);
    }
    
    return this.mergeResults(results);
  }
}
```

### Security Considerations

```typescript
export class SecurePlugin implements DataPrismPlugin {
  async execute(action: string, params: any): Promise<any> {
    // Validate input parameters
    this.validateParams(action, params);
    
    // Check permissions
    if (!this.hasPermission(action)) {
      throw new Error("Insufficient permissions");
    }
    
    // Sanitize data
    const sanitizedParams = this.sanitizeParams(params);
    
    return this.performAction(action, sanitizedParams);
  }
  
  private validateParams(action: string, params: any): void {
    // Implement parameter validation
    if (!params || typeof params !== "object") {
      throw new Error("Invalid parameters");
    }
  }
  
  private hasPermission(action: string): boolean {
    // Implement permission checking
    return true;
  }
  
  private sanitizeParams(params: any): any {
    // Implement data sanitization
    return params;
  }
}
```

## Publishing Plugins

### Package Structure

```
my-dataprism-plugin/
├── src/
│   ├── index.ts
│   ├── plugin.ts
│   └── types.ts
├── tests/
│   ├── plugin.test.ts
│   └── integration.test.ts
├── docs/
│   └── README.md
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Package.json

```json
{
  "name": "@dataprism/plugin-my-custom",
  "version": "1.0.0",
  "description": "Custom plugin for DataPrism",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["dataprism", "plugin", "analytics"],
  "peerDependencies": {
    "@dataprism/core": "^1.0.0"
  },
  "devDependencies": {
    "@dataprism/testing": "^1.0.0",
    "typescript": "^4.9.0",
    "jest": "^29.0.0"
  }
}
```

### Publishing to NPM

```bash
# Build the plugin
npm run build

# Run tests
npm test

# Publish to NPM
npm publish
```

## Examples

See the [Plugin Examples](/examples/plugins) page for more comprehensive examples and use cases.

## Next Steps

1. **Study existing plugins** - Look at the [out-of-box plugins](/plugins/out-of-box/) for reference
2. **Set up development environment** - Use the DataPrism plugin development tools
3. **Start with a simple plugin** - Begin with basic data processing
4. **Add tests** - Write comprehensive unit and integration tests
5. **Document your plugin** - Create clear documentation and examples
6. **Share with community** - Publish your plugin for others to use

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.
