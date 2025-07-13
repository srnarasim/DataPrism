# DataPrism Core Out-of-the-Box Plugins Collection

**Product Requirements Prompt (PRP)**

## 1. Executive Summary

### Overview

Implement a comprehensive collection of production-ready plugins for DataPrism Core that cover the most common use cases in browser-based analytics. This baseline plugin collection will provide immediate value to users while demonstrating the full capabilities of the DataPrism plugin architecture.

### Primary Objectives

- **Immediate Utility**: Provide essential functionality out-of-the-box without requiring custom plugin development
- **Reference Implementation**: Demonstrate best practices for plugin development across all four categories
- **Performance Benchmark**: Establish performance baselines for complex plugin operations
- **Architecture Validation**: Validate the plugin system's ability to handle diverse, real-world use cases

### Success Criteria

- All 8 core plugins implemented and functional
- Performance targets met for each plugin category
- Comprehensive test coverage (>90%) across all plugins
- Browser compatibility validated on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Bundle size optimized (total collection <2MB gzipped)

### Architecture Layers Affected

- **Plugin System**: Core plugin interfaces and management
- **JavaScript Orchestration**: TypeScript integration layer
- **WASM Integration**: Performance-critical operations
- **Browser APIs**: File handling, workers, networking

## 2. Context and Background

### Current State

DataPrism Core has a robust plugin architecture with four categories (Visualization, Integration, Data Processing, Utility) and comprehensive interfaces. However, the system currently lacks production-ready plugins that demonstrate real-world functionality and provide immediate value to users.

### Business Justification

- **User Adoption**: Reduce friction for new users by providing essential functionality immediately
- **Development Velocity**: Enable teams to focus on business logic rather than infrastructure
- **Quality Assurance**: Provide tested, optimized reference implementations
- **Ecosystem Growth**: Establish patterns and standards for community plugin development

### Architecture Integration

The plugin collection integrates with existing DataPrism Core architecture:

```
┌─────────────────────────────────────────┐
│           Browser Environment           │
├─────────────────────────────────────────┤
│  Out-of-Box Plugin Collection (8 plugins)
│  ├── Visualization (2): Charts, Plotly  │
│  ├── Integration (3): CSV, Parquet, LLM │
│  ├── Processing (2): Clustering, Dedup  │
│  └── Utility (1): Performance Monitor   │
├─────────────────────────────────────────┤
│         DataPrism Plugin System         │
│  ├── Plugin Manager & Registry         │
│  ├── Security & Sandboxing             │
│  ├── Event Bus & Communication         │
│  └── Resource Management               │
├─────────────────────────────────────────┤
│      JavaScript Orchestration Layer    │
│  ├── TypeScript APIs                   │
│  ├── Worker Management                 │
│  └── Browser Integration               │
├─────────────────────────────────────────┤
│        Core WASM Engine (DuckDB)       │
└─────────────────────────────────────────┘
```

## 3. Technical Specifications

### Performance Requirements

- **Plugin Load Time**: <300ms for individual plugins
- **Bundle Size**: Each plugin <150KB gzipped
- **Memory Efficiency**: <25MB total collection overhead
- **Query Performance**: Maintain <2s query response time with plugins active
- **Concurrency**: Support 5+ simultaneous plugin operations

### Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebAssembly**: WASM MVP specification compliance
- **Workers**: Web Workers and SharedArrayBuffer support
- **ES Modules**: Native ES2020 module support

### Security Requirements

- **Sandboxing**: All plugins run in secure sandboxes with limited permissions
- **Data Privacy**: No sensitive data transmitted without explicit consent
- **Resource Limits**: CPU, memory, and network usage constraints
- **Input Validation**: Comprehensive validation for all user inputs

### Integration Requirements

- **DuckDB-WASM**: Seamless integration with analytical engine
- **Arrow Format**: Efficient data exchange via Apache Arrow
- **Event System**: Reactive updates via plugin event bus
- **TypeScript**: Full type safety and IntelliSense support

## 4. Implementation Plan

### Step 1: Foundation and Infrastructure Setup

**Duration**: 2-3 days

#### Environment Preparation

```bash
# Create plugin collection structure
mkdir -p packages/plugins/out-of-box/{visualization,integration,processing,utility}
mkdir -p packages/plugins/out-of-box/shared/{utils,types,constants}

# Setup build infrastructure
npm install --save-dev rollup vite typescript vitest playwright
```

#### Shared Utilities Implementation

Create common utilities used across all plugins:

**File**: `packages/plugins/out-of-box/shared/utils/performance.ts`

```typescript
export class PerformanceTracker {
  private metrics = new Map<string, number[]>();

  startTiming(operation: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      return duration;
    };
  }

  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(value);
  }

  getStats(operation: string) {
    const values = this.metrics.get(operation) || [];
    return {
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p95: this.percentile(values, 0.95),
    };
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }
}
```

**File**: `packages/plugins/out-of-box/shared/utils/worker-manager.ts`

```typescript
export class WorkerManager {
  private workers = new Map<string, Worker>();
  private workerPool: Worker[] = [];

  async createWorker(script: string, options?: WorkerOptions): Promise<Worker> {
    const worker = new Worker(script, { type: "module", ...options });
    return worker;
  }

  async executeInWorker<T>(
    workerId: string,
    operation: string,
    data: any,
  ): Promise<T> {
    const worker = this.workers.get(workerId);
    if (!worker) throw new Error(`Worker ${workerId} not found`);

    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36);

      const handler = (event: MessageEvent) => {
        if (event.data.messageId === messageId) {
          worker.removeEventListener("message", handler);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      worker.addEventListener("message", handler);
      worker.postMessage({ messageId, operation, data });
    });
  }

  dispose(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.workerPool.forEach((worker) => worker.terminate());
    this.workers.clear();
    this.workerPool.length = 0;
  }
}
```

### Step 2: Visualization Plugins Implementation

**Duration**: 3-4 days

#### 2.1 Observable Charts Plugin

**File**: `packages/plugins/out-of-box/visualization/observable-charts/index.ts`

```typescript
import {
  IVisualizationPlugin,
  VisualizationType,
  RenderConfig,
} from "@dataprism/plugins";
import { Dataset } from "@dataprism/plugins";
import { PerformanceTracker } from "../../shared/utils/performance.js";

export class ObservableChartsPlugin implements IVisualizationPlugin {
  private performanceTracker = new PerformanceTracker();
  private chartInstances = new Map<Element, any>();
  private context: PluginContext | null = null;

  getName(): string {
    return "observable-charts";
  }
  getVersion(): string {
    return "1.0.0";
  }
  getDescription(): string {
    return "High-performance reactive charts using Observable Framework";
  }
  getAuthor(): string {
    return "DataPrism Team";
  }

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    // Load Observable runtime
    await this.loadObservableRuntime();
  }

  async render(
    container: Element,
    data: Dataset,
    config?: RenderConfig,
  ): Promise<void> {
    const endTiming = this.performanceTracker.startTiming("render");

    try {
      const chartType = this.detectOptimalChartType(data);
      const chartSpec = this.generateChartSpec(data, chartType, config);

      // Create Observable notebook with chart
      const notebook = await this.createNotebook(chartSpec);
      const chart = await notebook.value("chart");

      // Render chart in container
      container.innerHTML = "";
      container.appendChild(chart);

      this.chartInstances.set(container, { notebook, chart, data });

      this.context?.eventBus.publish("chart:rendered", {
        plugin: this.getName(),
        type: chartType,
        dataPoints: data.data.length,
      });
    } finally {
      const duration = endTiming();
      this.context?.logger.info(`Chart rendered in ${duration.toFixed(2)}ms`);
    }
  }

  getVisualizationTypes(): VisualizationType[] {
    return [
      {
        name: "bar",
        description: "Bar chart with categorical data",
        category: "chart",
        requiredFields: [
          {
            name: "category",
            types: ["string"],
            multiple: false,
            description: "Category field",
          },
          {
            name: "value",
            types: ["number"],
            multiple: false,
            description: "Numeric value",
          },
        ],
        optionalFields: [
          {
            name: "series",
            types: ["string"],
            multiple: false,
            description: "Series grouping",
          },
        ],
        complexity: "simple",
      },
      {
        name: "line",
        description: "Line chart for time series data",
        category: "chart",
        requiredFields: [
          {
            name: "x",
            types: ["date", "number"],
            multiple: false,
            description: "X-axis values",
          },
          {
            name: "y",
            types: ["number"],
            multiple: false,
            description: "Y-axis values",
          },
        ],
        optionalFields: [
          {
            name: "series",
            types: ["string"],
            multiple: false,
            description: "Series grouping",
          },
        ],
        complexity: "simple",
      },
      {
        name: "scatter",
        description: "Scatter plot for correlation analysis",
        category: "chart",
        requiredFields: [
          {
            name: "x",
            types: ["number"],
            multiple: false,
            description: "X-axis values",
          },
          {
            name: "y",
            types: ["number"],
            multiple: false,
            description: "Y-axis values",
          },
        ],
        optionalFields: [
          {
            name: "size",
            types: ["number"],
            multiple: false,
            description: "Point size",
          },
          {
            name: "color",
            types: ["string", "number"],
            multiple: false,
            description: "Point color",
          },
        ],
        complexity: "moderate",
      },
      {
        name: "histogram",
        description: "Histogram for distribution analysis",
        category: "chart",
        requiredFields: [
          {
            name: "value",
            types: ["number"],
            multiple: false,
            description: "Values to bin",
          },
        ],
        optionalFields: [
          {
            name: "bins",
            types: ["number"],
            multiple: false,
            description: "Number of bins",
          },
        ],
        complexity: "simple",
      },
      {
        name: "area",
        description: "Area chart for cumulative data",
        category: "chart",
        requiredFields: [
          {
            name: "x",
            types: ["date", "number"],
            multiple: false,
            description: "X-axis values",
          },
          {
            name: "y",
            types: ["number"],
            multiple: false,
            description: "Y-axis values",
          },
        ],
        optionalFields: [
          {
            name: "series",
            types: ["string"],
            multiple: false,
            description: "Series stacking",
          },
        ],
        complexity: "moderate",
      },
    ];
  }

  private detectOptimalChartType(data: Dataset): string {
    const fields = Object.keys(data.data[0] || {});
    const fieldTypes = this.analyzeFieldTypes(data);

    // Simple heuristics for chart type detection
    const numericFields = fieldTypes.filter((f) => f.type === "number").length;
    const categoricalFields = fieldTypes.filter(
      (f) => f.type === "string",
    ).length;
    const dateFields = fieldTypes.filter((f) => f.type === "date").length;

    if (dateFields > 0 && numericFields > 0) return "line";
    if (numericFields >= 2) return "scatter";
    if (categoricalFields > 0 && numericFields > 0) return "bar";
    if (numericFields === 1) return "histogram";

    return "bar"; // default fallback
  }

  private generateChartSpec(
    data: Dataset,
    chartType: string,
    config?: RenderConfig,
  ) {
    return {
      data: data.data,
      type: chartType,
      theme: config?.theme || "light",
      responsive: config?.responsive ?? true,
      animation: config?.animation ?? true,
      interaction: config?.interaction ?? true,
    };
  }

  private async loadObservableRuntime(): Promise<void> {
    // In real implementation, load Observable runtime
    // For now, simulate loading
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async createNotebook(spec: any): Promise<any> {
    // Mock notebook creation - in real implementation, use Observable runtime
    return {
      value: async (name: string) => {
        if (name === "chart") {
          const div = document.createElement("div");
          div.innerHTML = `<div style="width: 100%; height: 400px; background: #f5f5f5; display: flex; align-items: center; justify-content: center;">
            ${spec.type.toUpperCase()} Chart (${spec.data.length} points)
          </div>`;
          return div.firstElementChild!;
        }
        return null;
      },
    };
  }

  private analyzeFieldTypes(data: Dataset) {
    const sample = data.data[0] || {};
    return Object.entries(sample).map(([field, value]) => ({
      field,
      type: this.inferType(value),
    }));
  }

  private inferType(value: any): string {
    if (typeof value === "number") return "number";
    if (value instanceof Date || !isNaN(Date.parse(value))) return "date";
    return "string";
  }

  // Implement remaining interface methods...
  async activate(): Promise<void> {}
  async deactivate(): Promise<void> {}
  async cleanup(): Promise<void> {
    this.chartInstances.clear();
  }
  async execute(operation: string, params: any): Promise<any> {
    return {};
  }
  async configure(settings: any): Promise<void> {}
  getManifest() {
    return {};
  }
  getCapabilities() {
    return [];
  }
  isCompatible() {
    return true;
  }
  getDependencies() {
    return [];
  }
  async update(data: Dataset): Promise<void> {}
  async resize(dimensions: any): Promise<void> {}
  async destroy(): Promise<void> {}
  getSupportedDataTypes() {
    return [];
  }
  getInteractionFeatures() {
    return [];
  }
  async export(format: any): Promise<Blob> {
    return new Blob();
  }
  getConfiguration() {
    return {};
  }
  setConfiguration(config: any): Promise<void> {
    return Promise.resolve();
  }
  async onInteraction(event: any): Promise<void> {}
  getSelectionData() {
    return [];
  }
  async clearSelection(): Promise<void> {}
}
```

### Step 3: Integration Plugins Implementation

**Duration**: 4-5 days

#### 3.1 CSV Importer Plugin

**File**: `packages/plugins/out-of-box/integration/csv-importer/index.ts`

```typescript
import { IIntegrationPlugin, Dataset } from "@dataprism/plugins";
import { WorkerManager } from "../../shared/utils/worker-manager.js";

export class CSVImporterPlugin implements IIntegrationPlugin {
  private workerManager = new WorkerManager();
  private context: PluginContext | null = null;

  getName(): string {
    return "csv-importer";
  }
  getVersion(): string {
    return "1.0.0";
  }
  getDescription(): string {
    return "High-performance CSV import with automatic type inference";
  }

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    await this.setupWorker();
  }

  async importFile(file: File, options?: CSVImportOptions): Promise<Dataset> {
    this.context?.logger.info(
      `Importing CSV file: ${file.name} (${file.size} bytes)`,
    );

    const startTime = performance.now();

    try {
      // Stream file through worker for parsing
      const parseResult = await this.parseCSVInWorker(file, options);

      // Create DuckDB table
      const tableName = `csv_import_${Date.now()}`;
      await this.createDuckDBTable(tableName, parseResult);

      const dataset: Dataset = {
        id: tableName,
        name: file.name,
        schema: parseResult.schema,
        data: parseResult.data,
        metadata: {
          source: "csv-import",
          filename: file.name,
          fileSize: file.size,
          rowCount: parseResult.data.length,
          importTime: performance.now() - startTime,
          encoding: parseResult.encoding,
          delimiter: parseResult.delimiter,
        },
      };

      this.context?.eventBus.publish("data:imported", {
        plugin: this.getName(),
        dataset: dataset.id,
        rowCount: dataset.data.length,
      });

      return dataset;
    } catch (error) {
      this.context?.logger.error("CSV import failed", error);
      throw error;
    }
  }

  private async parseCSVInWorker(file: File, options?: CSVImportOptions) {
    const workerId = "csv-parser";

    return this.workerManager.executeInWorker(workerId, "parseCSV", {
      file: await file.arrayBuffer(),
      filename: file.name,
      options: {
        delimiter: options?.delimiter || "auto",
        encoding: options?.encoding || "utf-8",
        hasHeader: options?.hasHeader ?? true,
        preview: options?.preview ?? false,
        maxRows: options?.maxRows || Number.MAX_SAFE_INTEGER,
      },
    });
  }

  private async createDuckDBTable(
    tableName: string,
    parseResult: any,
  ): Promise<void> {
    // Integration with DuckDB-WASM
    const createSQL = this.generateCreateTableSQL(
      tableName,
      parseResult.schema,
    );
    await this.context?.services.call("duckdb", "execute", createSQL);

    // Insert data in batches
    const batchSize = 1000;
    for (let i = 0; i < parseResult.data.length; i += batchSize) {
      const batch = parseResult.data.slice(i, i + batchSize);
      const insertSQL = this.generateInsertSQL(tableName, batch);
      await this.context?.services.call("duckdb", "execute", insertSQL);
    }
  }

  private generateCreateTableSQL(tableName: string, schema: any): string {
    const columns = schema.fields
      .map((field: any) => `${field.name} ${this.mapTypeToDuckDB(field.type)}`)
      .join(", ");

    return `CREATE TABLE ${tableName} (${columns})`;
  }

  private mapTypeToDuckDB(type: string): string {
    const typeMap: Record<string, string> = {
      string: "VARCHAR",
      number: "DOUBLE",
      integer: "INTEGER",
      boolean: "BOOLEAN",
      date: "DATE",
      timestamp: "TIMESTAMP",
    };
    return typeMap[type] || "VARCHAR";
  }

  // Implement remaining interface methods...
  async activate(): Promise<void> {}
  async deactivate(): Promise<void> {}
  async cleanup(): Promise<void> {
    this.workerManager.dispose();
  }
  async execute(operation: string, params: any): Promise<any> {
    return {};
  }
  async configure(settings: any): Promise<void> {}
  getManifest() {
    return {};
  }
  getCapabilities() {
    return [];
  }
  isCompatible() {
    return true;
  }
  getDependencies() {
    return [];
  }
  async connect(source: any): Promise<any> {
    return {};
  }
  async disconnect(connectionId: string): Promise<void> {}
  async sync(connectionId: string, options?: any): Promise<any> {
    return {};
  }
}

export interface CSVImportOptions {
  delimiter?: string;
  encoding?: "utf-8" | "utf-16" | "latin-1";
  hasHeader?: boolean;
  preview?: boolean;
  maxRows?: number;
}
```

#### 3.2 CSV Parser Worker

**File**: `packages/plugins/out-of-box/integration/csv-importer/worker.ts`

```typescript
// CSV parsing worker using PapaParse
import Papa from "papaparse";

self.addEventListener("message", async (event) => {
  const { messageId, operation, data } = event.data;

  try {
    let result;

    switch (operation) {
      case "parseCSV":
        result = await parseCSVData(data);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    self.postMessage({ messageId, result });
  } catch (error) {
    self.postMessage({ messageId, error: error.message });
  }
});

async function parseCSVData(data: any) {
  const { file, filename, options } = data;
  const text = new TextDecoder(options.encoding).decode(file);

  // Auto-detect delimiter if needed
  let delimiter = options.delimiter;
  if (delimiter === "auto") {
    delimiter = detectDelimiter(text);
  }

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      delimiter,
      header: options.hasHeader,
      skipEmptyLines: true,
      dynamicTyping: true,
      transform: (value: string, field: string) => {
        // Custom transformations
        return value?.trim();
      },
      complete: (results) => {
        const schema = inferSchema(results.data, options.hasHeader);

        resolve({
          data: results.data,
          schema,
          errors: results.errors,
          delimiter,
          encoding: options.encoding,
          rowCount: results.data.length,
        });
      },
      error: reject,
    });
  });
}

function detectDelimiter(text: string): string {
  const sample = text.split("\n").slice(0, 5).join("\n");
  const delimiters = [",", ";", "\t", "|"];

  let bestDelimiter = ",";
  let maxConsistency = 0;

  for (const delimiter of delimiters) {
    const lines = sample.split("\n");
    const counts = lines.map(
      (line) => (line.match(new RegExp(delimiter, "g")) || []).length,
    );

    if (counts.length > 1) {
      const consistency = counts.every((count) => count === counts[0])
        ? counts[0]
        : 0;
      if (consistency > maxConsistency) {
        maxConsistency = consistency;
        bestDelimiter = delimiter;
      }
    }
  }

  return bestDelimiter;
}

function inferSchema(data: any[], hasHeader: boolean) {
  if (!data.length) return { fields: [] };

  const sample = data.slice(0, Math.min(1000, data.length));
  const fields = [];

  if (hasHeader && typeof data[0] === "object") {
    // Object with headers
    for (const [key, value] of Object.entries(data[0])) {
      fields.push({
        name: key,
        type: inferFieldType(sample.map((row) => row[key])),
      });
    }
  } else {
    // Array without headers
    const sampleRow = Array.isArray(data[0]) ? data[0] : [data[0]];
    for (let i = 0; i < sampleRow.length; i++) {
      fields.push({
        name: `column_${i + 1}`,
        type: inferFieldType(
          sample.map((row) => (Array.isArray(row) ? row[i] : null)),
        ),
      });
    }
  }

  return { fields };
}

function inferFieldType(values: any[]): string {
  const nonNullValues = values.filter((v) => v != null && v !== "");
  if (!nonNullValues.length) return "string";

  // Check for numbers
  const numericValues = nonNullValues.filter(
    (v) => typeof v === "number" || !isNaN(Number(v)),
  );
  if (numericValues.length / nonNullValues.length > 0.8) {
    const hasDecimals = numericValues.some((v) => Number(v) % 1 !== 0);
    return hasDecimals ? "number" : "integer";
  }

  // Check for dates
  const dateValues = nonNullValues.filter((v) => !isNaN(Date.parse(v)));
  if (dateValues.length / nonNullValues.length > 0.8) {
    return "date";
  }

  // Check for booleans
  const booleanValues = nonNullValues.filter((v) =>
    ["true", "false", "1", "0", "yes", "no"].includes(String(v).toLowerCase()),
  );
  if (booleanValues.length / nonNullValues.length > 0.8) {
    return "boolean";
  }

  return "string";
}
```

### Step 4: Data Processing Plugins Implementation

**Duration**: 3-4 days

#### 4.1 Semantic Clustering Plugin

**File**: `packages/plugins/out-of-box/processing/semantic-clustering/index.ts`

```typescript
import { IDataProcessorPlugin, Dataset } from "@dataprism/plugins";
import { WorkerManager } from "../../shared/utils/worker-manager.js";

export class SemanticClusteringPlugin implements IDataProcessorPlugin {
  private workerManager = new WorkerManager();
  private context: PluginContext | null = null;

  getName(): string {
    return "semantic-clustering";
  }
  getVersion(): string {
    return "1.0.0";
  }
  getDescription(): string {
    return "Machine learning clustering with embeddings and visualization";
  }

  async process(data: Dataset, options?: ClusteringOptions): Promise<Dataset> {
    this.context?.logger.info(
      `Starting clustering analysis for ${data.data.length} rows`,
    );

    const startTime = performance.now();

    try {
      // Generate embeddings
      const embeddings = await this.generateEmbeddings(data, options);

      // Perform clustering
      const clusters = await this.performClustering(embeddings, options);

      // Generate visualization data
      const visualization = await this.generateVisualization(
        embeddings,
        clusters,
        options,
      );

      // Create result dataset
      const resultData = data.data.map((row, index) => ({
        ...row,
        cluster_id: clusters.labels[index],
        cluster_confidence: clusters.confidences?.[index] || 1.0,
        embedding_x: visualization.coordinates[index][0],
        embedding_y: visualization.coordinates[index][1],
      }));

      const result: Dataset = {
        id: `${data.id}_clustered`,
        name: `${data.name} (Clustered)`,
        schema: {
          ...data.schema,
          fields: [
            ...data.schema.fields,
            { name: "cluster_id", type: "integer" },
            { name: "cluster_confidence", type: "number" },
            { name: "embedding_x", type: "number" },
            { name: "embedding_y", type: "number" },
          ],
        },
        data: resultData,
        metadata: {
          ...data.metadata,
          clustering: {
            algorithm: options?.algorithm || "kmeans",
            num_clusters: clusters.numClusters,
            silhouette_score: clusters.metrics.silhouetteScore,
            davies_bouldin_score: clusters.metrics.daviesBouldinScore,
            processing_time: performance.now() - startTime,
          },
        },
      };

      this.context?.eventBus.publish("clustering:completed", {
        plugin: this.getName(),
        dataset: result.id,
        clusters: clusters.numClusters,
        quality: clusters.metrics.silhouetteScore,
      });

      return result;
    } catch (error) {
      this.context?.logger.error("Clustering failed", error);
      throw error;
    }
  }

  private async generateEmbeddings(data: Dataset, options?: ClusteringOptions) {
    const textFields = this.identifyTextFields(data);
    const numericFields = this.identifyNumericFields(data);

    if (textFields.length === 0 && numericFields.length === 0) {
      throw new Error("No suitable fields found for clustering");
    }

    return this.workerManager.executeInWorker(
      "embeddings",
      "generateEmbeddings",
      {
        data: data.data,
        textFields,
        numericFields,
        model: options?.embeddingModel || "universal-sentence-encoder",
        dimension: options?.embeddingDimension || 384,
      },
    );
  }

  private async performClustering(
    embeddings: number[][],
    options?: ClusteringOptions,
  ) {
    return this.workerManager.executeInWorker(
      "clustering",
      "performClustering",
      {
        embeddings,
        algorithm: options?.algorithm || "kmeans",
        numClusters:
          options?.numClusters ||
          this.estimateOptimalClusters(embeddings.length),
        parameters: options?.parameters || {},
      },
    );
  }

  private async generateVisualization(
    embeddings: number[][],
    clusters: any,
    options?: ClusteringOptions,
  ) {
    return this.workerManager.executeInWorker("visualization", "generateTSNE", {
      embeddings,
      clusters: clusters.labels,
      perplexity: options?.visualizationPerplexity || 30,
      learningRate: options?.visualizationLearningRate || 200,
    });
  }

  private identifyTextFields(data: Dataset): string[] {
    return data.schema.fields
      .filter((field) => field.type === "string")
      .map((field) => field.name);
  }

  private identifyNumericFields(data: Dataset): string[] {
    return data.schema.fields
      .filter((field) => ["number", "integer"].includes(field.type))
      .map((field) => field.name);
  }

  private estimateOptimalClusters(dataSize: number): number {
    // Use elbow method heuristic
    return Math.min(Math.max(Math.floor(Math.sqrt(dataSize / 2)), 2), 20);
  }

  // Implement remaining interface methods...
  async activate(): Promise<void> {}
  async deactivate(): Promise<void> {}
  async cleanup(): Promise<void> {
    this.workerManager.dispose();
  }
  async execute(operation: string, params: any): Promise<any> {
    return {};
  }
  async configure(settings: any): Promise<void> {}
  getManifest() {
    return {};
  }
  getCapabilities() {
    return [];
  }
  isCompatible() {
    return true;
  }
  getDependencies() {
    return [];
  }
  async initialize(context: any): Promise<void> {
    this.context = context;
  }
  async transform(data: Dataset, rules: any[]): Promise<Dataset> {
    return data;
  }
  async validate(data: Dataset): Promise<any> {
    return { isValid: true };
  }
  getProcessingCapabilities() {
    return [];
  }
  getSupportedDataTypes() {
    return [];
  }
  getPerformanceMetrics() {
    return {};
  }
  async batch(datasets: Dataset[]): Promise<Dataset[]> {
    return datasets;
  }
  async stream(
    dataStream: ReadableStream<Dataset>,
  ): Promise<ReadableStream<Dataset>> {
    return dataStream;
  }
}

export interface ClusteringOptions {
  algorithm?: "kmeans" | "dbscan" | "hierarchical";
  numClusters?: number;
  embeddingModel?: string;
  embeddingDimension?: number;
  visualizationPerplexity?: number;
  visualizationLearningRate?: number;
  parameters?: Record<string, any>;
}
```

### Step 5: Utility Plugin Implementation

**Duration**: 2-3 days

#### 5.1 Performance Monitor Plugin

**File**: `packages/plugins/out-of-box/utility/performance-monitor/index.ts`

```typescript
import { IUtilityPlugin, UtilityFeature } from "@dataprism/plugins";

export class PerformanceMonitorPlugin implements IUtilityPlugin {
  private context: PluginContext | null = null;
  private monitoringInterval: number | null = null;
  private overlay: HTMLElement | null = null;
  private metrics = new Map<string, any[]>();
  private thresholds = {
    fps: 30,
    memory: 1000, // MB
    queryTime: 2000, // ms
    wasmHeap: 500, // MB
  };

  getName(): string {
    return "performance-monitor";
  }
  getVersion(): string {
    return "1.0.0";
  }
  getDescription(): string {
    return "Real-time performance monitoring dashboard";
  }

  async activate(): Promise<void> {
    await this.startMonitoring();
    this.createOverlay();
  }

  getUtilityFeatures(): UtilityFeature[] {
    return [
      {
        name: "real-time-monitoring",
        description: "Live performance metrics display",
        category: "monitoring",
        enabled: true,
      },
      {
        name: "performance-alerts",
        description: "Threshold-based alerting system",
        category: "alerting",
        enabled: true,
      },
      {
        name: "metrics-export",
        description: "Export performance data as CSV",
        category: "export",
        enabled: true,
      },
      {
        name: "overlay-display",
        description: "Floating performance overlay",
        category: "visualization",
        enabled: true,
      },
    ];
  }

  private async startMonitoring(): Promise<void> {
    this.monitoringInterval = window.setInterval(() => {
      this.collectMetrics();
    }, 1000);

    // Hook into performance marks
    this.setupPerformanceObserver();

    // Monitor DuckDB queries
    this.setupQueryMonitoring();
  }

  private collectMetrics(): void {
    const timestamp = Date.now();

    // FPS calculation
    const fps = this.calculateFPS();
    this.recordMetric("fps", { value: fps, timestamp });

    // Memory usage
    const memory = this.getMemoryUsage();
    this.recordMetric("memory", { value: memory, timestamp });

    // WebAssembly heap
    const wasmHeap = this.getWasmHeapUsage();
    this.recordMetric("wasmHeap", { value: wasmHeap, timestamp });

    // Check thresholds
    this.checkThresholds({ fps, memory, wasmHeap });

    // Update overlay
    this.updateOverlay({ fps, memory, wasmHeap });
  }

  private calculateFPS(): number {
    // Simple FPS calculation using requestAnimationFrame
    const now = performance.now();
    const fps = 1000 / (now - (this.lastFrameTime || now));
    this.lastFrameTime = now;
    return Math.round(fps);
  }

  private getMemoryUsage(): number {
    if ("memory" in performance) {
      const mem = (performance as any).memory;
      return Math.round(mem.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  private getWasmHeapUsage(): number {
    // In real implementation, get from DuckDB-WASM
    return Math.round(Math.random() * 100); // Mock value
  }

  private checkThresholds(current: any): void {
    if (current.fps < this.thresholds.fps) {
      this.createAlert("fps", "Low FPS detected", current.fps);
    }

    if (current.memory > this.thresholds.memory) {
      this.createAlert("memory", "High memory usage", current.memory);
    }

    if (current.wasmHeap > this.thresholds.wasmHeap) {
      this.createAlert("wasmHeap", "High WASM heap usage", current.wasmHeap);
    }
  }

  private createAlert(type: string, message: string, value: number): void {
    const alert = {
      type,
      message,
      value,
      timestamp: Date.now(),
      severity: this.calculateSeverity(type, value),
    };

    this.context?.eventBus.publish("performance:alert", alert);
    this.showToast(alert);
  }

  private createOverlay(): void {
    this.overlay = document.createElement("div");
    this.overlay.id = "dataprism-performance-overlay";
    this.overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      min-width: 200px;
      backdrop-filter: blur(4px);
    `;

    document.body.appendChild(this.overlay);
  }

  private updateOverlay(metrics: any): void {
    if (!this.overlay) return;

    this.overlay.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold;">DataPrism Performance</div>
      <div>FPS: ${metrics.fps}</div>
      <div>Memory: ${metrics.memory} MB</div>
      <div>WASM Heap: ${metrics.wasmHeap} MB</div>
      <div>Queries: ${this.getRecentQueryCount()}</div>
    `;
  }

  async exportMetrics(): Promise<Blob> {
    const allMetrics: any[] = [];

    for (const [type, values] of this.metrics) {
      for (const value of values) {
        allMetrics.push({
          type,
          timestamp: new Date(value.timestamp).toISOString(),
          value: value.value,
        });
      }
    }

    // Convert to CSV
    const headers = "type,timestamp,value\n";
    const rows = allMetrics
      .map((m) => `${m.type},${m.timestamp},${m.value}`)
      .join("\n");
    const csv = headers + rows;

    return new Blob([csv], { type: "text/csv" });
  }

  // Helper methods...
  private recordMetric(type: string, data: any): void {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }

    const values = this.metrics.get(type)!;
    values.push(data);

    // Keep only last 1000 entries
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }
  }

  // Implement remaining interface methods...
  async initialize(context: any): Promise<void> {
    this.context = context;
  }
  async deactivate(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.overlay?.remove();
  }
  async cleanup(): Promise<void> {
    this.metrics.clear();
    this.overlay?.remove();
  }
  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case "exportMetrics":
        return this.exportMetrics();
      case "getMetrics":
        return Object.fromEntries(this.metrics);
      default:
        return {};
    }
  }
  async configure(settings: any): Promise<void> {
    if (settings.thresholds) {
      this.thresholds = { ...this.thresholds, ...settings.thresholds };
    }
  }
  getManifest() {
    return {};
  }
  getCapabilities() {
    return [];
  }
  isCompatible() {
    return true;
  }
  getDependencies() {
    return [];
  }
  getAuthor() {
    return "DataPrism Team";
  }
}
```

### Step 6: Integration and Testing

**Duration**: 2-3 days

#### Build Configuration

**File**: `packages/plugins/out-of-box/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "observable-charts": resolve(
          __dirname,
          "visualization/observable-charts/index.ts",
        ),
        "csv-importer": resolve(__dirname, "integration/csv-importer/index.ts"),
        "parquet-importer": resolve(
          __dirname,
          "integration/parquet-importer/index.ts",
        ),
        "openai-connector": resolve(
          __dirname,
          "integration/openai-connector/index.ts",
        ),
        "semantic-clustering": resolve(
          __dirname,
          "processing/semantic-clustering/index.ts",
        ),
        "duplicate-detection": resolve(
          __dirname,
          "processing/duplicate-detection/index.ts",
        ),
        "performance-monitor": resolve(
          __dirname,
          "utility/performance-monitor/index.ts",
        ),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["@dataprism/plugins", "@dataprism/core"],
      output: {
        dir: "dist",
        preserveModules: false,
      },
    },
    target: "es2020",
    sourcemap: true,
  },
  worker: {
    format: "es",
  },
});
```

#### Comprehensive Test Suite

**File**: `packages/plugins/out-of-box/tests/integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ObservableChartsPlugin } from "../visualization/observable-charts/index.js";
import { CSVImporterPlugin } from "../integration/csv-importer/index.js";
import { SemanticClusteringPlugin } from "../processing/semantic-clustering/index.js";
import { PerformanceMonitorPlugin } from "../utility/performance-monitor/index.js";

describe("Out-of-Box Plugins Integration", () => {
  let mockContext: any;

  beforeAll(() => {
    mockContext = {
      pluginName: "test-plugin",
      coreVersion: "1.0.0",
      services: {
        call: async (service: string, method: string, ...args: any[]) => ({
          success: true,
        }),
        hasPermission: () => true,
      },
      eventBus: {
        publish: (event: string, data: any) =>
          console.log(`Event: ${event}`, data),
        subscribe: (event: string, handler: any) => ({ unsubscribe: () => {} }),
      },
      logger: {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
      },
      config: {},
      resources: {
        maxMemoryMB: 1000,
        maxCpuPercent: 80,
        maxExecutionTime: 30000,
      },
    };
  });

  describe("Observable Charts Plugin", () => {
    it("should initialize and render charts", async () => {
      const plugin = new ObservableChartsPlugin();
      await plugin.initialize(mockContext);
      await plugin.activate();

      const dataset = {
        id: "test-data",
        name: "Test Dataset",
        schema: {
          fields: [
            { name: "x", type: "number" },
            { name: "y", type: "number" },
          ],
        },
        data: [
          { x: 1, y: 10 },
          { x: 2, y: 20 },
          { x: 3, y: 15 },
        ],
        metadata: {},
      };

      const container = document.createElement("div");
      await plugin.render(container, dataset);

      expect(container.children.length).toBeGreaterThan(0);
      expect(plugin.getVisualizationTypes().length).toBeGreaterThan(0);
    });
  });

  describe("CSV Importer Plugin", () => {
    it("should import CSV files", async () => {
      const plugin = new CSVImporterPlugin();
      await plugin.initialize(mockContext);
      await plugin.activate();

      const csvContent = "name,age,city\nJohn,30,NYC\nJane,25,LA";
      const file = new File([csvContent], "test.csv", { type: "text/csv" });

      const result = await plugin.importFile(file);

      expect(result.data.length).toBe(2);
      expect(result.data[0]).toHaveProperty("name", "John");
      expect(result.metadata.rowCount).toBe(2);
    });
  });

  describe("Performance Monitor Plugin", () => {
    it("should monitor performance metrics", async () => {
      const plugin = new PerformanceMonitorPlugin();
      await plugin.initialize(mockContext);
      await plugin.activate();

      // Wait for some metrics collection
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const metrics = await plugin.execute("getMetrics", {});
      expect(typeof metrics).toBe("object");

      const csv = await plugin.execute("exportMetrics", {});
      expect(csv instanceof Blob).toBe(true);
    });
  });
});

describe("Performance Benchmarks", () => {
  it("should meet performance targets", async () => {
    const plugin = new ObservableChartsPlugin();
    await plugin.initialize(mockContext);

    // Generate large dataset
    const largeDataset = {
      id: "large-test",
      name: "Large Dataset",
      schema: {
        fields: [
          { name: "x", type: "number" },
          { name: "y", type: "number" },
        ],
      },
      data: Array.from({ length: 10000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      })),
      metadata: {},
    };

    const container = document.createElement("div");
    const startTime = performance.now();

    await plugin.render(container, largeDataset);

    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(300); // < 300ms target
  });
});
```

## 5. Validation Commands

### Build and Compilation

```bash
# Install dependencies
cd packages/plugins/out-of-box
npm install

# Build all plugins
npm run build

# Build individual plugins
npm run build:visualization
npm run build:integration
npm run build:processing
npm run build:utility

# Type checking
npm run type-check

# Bundle size analysis
npm run analyze-bundle
```

### Testing

```bash
# Run all tests
npm test

# Integration tests
npm run test:integration

# Performance benchmarks
npm run test:performance

# Browser compatibility tests
npm run test:browser

# Visual regression tests (requires Playwright)
npm run test:visual
```

### Quality Assurance

```bash
# Lint all code
npm run lint

# Format code
npm run format

# Security audit
npm audit

# Bundle size check
npm run size-check

# Performance profiling
npm run profile
```

### Deployment Validation

```bash
# Build production bundle
npm run build:production

# Validate plugin manifests
npm run validate-manifests

# Test plugin loading
npm run test:plugin-loading

# Memory leak detection
npm run test:memory-leaks
```

## 6. Success Criteria

### Functional Requirements

- ✅ All 8 plugins implemented with full interface compliance
- ✅ Observable Charts supports 5+ chart types with interactivity
- ✅ CSV Importer handles files up to 4GB with streaming
- ✅ Semantic Clustering processes 100k+ records efficiently
- ✅ Performance Monitor provides real-time metrics

### Performance Targets

- ✅ Plugin load time <300ms each
- ✅ Bundle size <150KB gzipped per plugin
- ✅ Memory overhead <25MB for full collection
- ✅ Chart rendering 50k points at 30+ FPS
- ✅ CSV import 8+ MB/s throughput

### Quality Metrics

- ✅ Test coverage >90% across all plugins
- ✅ TypeScript strict mode compliance
- ✅ Zero security vulnerabilities
- ✅ Accessibility WCAG 2.1 AA compliance
- ✅ Browser compatibility verified

### Documentation and Examples

- ✅ Complete API documentation for all plugins
- ✅ Usage examples and tutorials
- ✅ Performance optimization guides
- ✅ Integration patterns documented
- ✅ Troubleshooting guides available

## 7. Risk Mitigation

### Technical Risks

1. **Bundle Size**: Progressive loading and tree-shaking
2. **Memory Usage**: Efficient cleanup and garbage collection
3. **Browser Compatibility**: Polyfills and feature detection
4. **Performance**: Web Workers and streaming processing

### Integration Risks

1. **Plugin Conflicts**: Isolated execution environments
2. **API Changes**: Versioned interfaces and compatibility layers
3. **Dependencies**: Minimal external dependencies, vendoring critical libs
4. **Security**: Strict CSP and permission validation

### Operational Risks

1. **Maintenance**: Comprehensive test coverage and CI/CD
2. **Updates**: Semantic versioning and migration guides
3. **Support**: Clear documentation and example code
4. **Monitoring**: Built-in telemetry and error reporting

This PRP provides a comprehensive roadmap for implementing a production-ready collection of out-of-the-box plugins that will significantly enhance DataPrism Core's immediate utility while establishing best practices for the plugin ecosystem.
