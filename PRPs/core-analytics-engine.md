# DataPrism Core Analytics Engine - Product Requirements Prompt

## Executive Summary

**Feature**: Implement the foundational DataPrism Core analytics engine with WebAssembly-powered computational modules, DuckDB integration for high-performance data processing, and TypeScript orchestration layer.

**Primary Objectives**:
- Create a hybrid architecture with Rust WASM modules and JavaScript orchestration
- Integrate DuckDB-WASM for analytical query processing
- Establish foundation for LLM integration and plugin system
- Achieve <2 second query response times for 95% of operations on 1M row datasets

**Architecture Layers Affected**: 
- Core WASM Engine (Rust modules)
- Orchestration Layer (TypeScript/JavaScript)
- Integration foundation for LLM and Plugin systems

## Context and Background

### Current State
DataPrism Core is a greenfield project with only basic directory structure in place. The project aims to be a WebAssembly-powered browser analytics engine that combines high-performance data processing with intelligent analysis capabilities.

### Why This Feature Is Needed
Modern web applications require analytical capabilities that can process large datasets efficiently within browser constraints. Traditional server-side analytics introduce latency and data privacy concerns. DataPrism Core addresses these challenges by:

1. **In-Browser Processing**: Eliminates data transfer overhead and privacy concerns
2. **High Performance**: Leverages WebAssembly for near-native computational speed
3. **Scalable Architecture**: Modular design supporting future enhancements
4. **Intelligence Integration**: Foundation for LLM-powered insights

### Architecture Fit
This implementation establishes the foundational architecture described in CLAUDE.md:
- **Core WASM Engine**: Rust modules for computational intensive operations
- **JavaScript Orchestration**: TypeScript layer for API management and coordination
- **DuckDB Integration**: High-performance analytical query processing
- **Extension Points**: Plugin system foundation and LLM integration hooks

## Technical Specifications

### Performance Targets
- **Query Response Time**: <2 seconds for 95% of analytical queries
- **Memory Usage**: <4GB for datasets up to 1M rows
- **Initialization Time**: <5 seconds for engine startup
- **WASM Bundle Size**: <6MB for optimal loading performance
- **API Latency**: <100ms for most operations

### Browser Compatibility
- **Target Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebAssembly Requirements**: MVP specification compliance
- **Memory Model**: 32-bit address space with efficient memory management
- **Threading**: Single-threaded initial implementation with multi-threading readiness

### Security Requirements
- **Input Validation**: Comprehensive validation for all external data
- **Memory Safety**: Rust's memory safety guarantees for WASM modules
- **Sandboxing**: WebAssembly isolation for safe code execution
- **CSP Compliance**: Content Security Policy compatibility
- **Data Protection**: Secure handling of sensitive data in memory

## Implementation Plan

### Step 1: Environment Setup and Project Structure

#### 1.1 Initialize Package Structure
```bash
# Create package.json files for each package
packages/
├── core/                 # Rust WASM core engine
│   ├── Cargo.toml
│   ├── src/
│   │   ├── lib.rs
│   │   ├── query_engine.rs
│   │   ├── memory_manager.rs
│   │   └── utils.rs
│   └── pkg/             # Generated WASM output
├── orchestration/       # TypeScript orchestration
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── engine.ts
│   │   ├── query-manager.ts
│   │   └── types.ts
│   └── dist/
├── llm/                 # LLM integration (future)
└── plugins/             # Plugin system (future)
```

#### 1.2 Core Dependencies Setup
**Rust WASM Core (packages/core/Cargo.toml)**:
```toml
[package]
name = "dataprism-core"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2"
web-sys = "0.3"
js-sys = "0.3"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.6"
console_error_panic_hook = "0.1"

[dependencies.wasm-bindgen]
version = "0.2"
features = [
  "serde-serialize",
]
```

**TypeScript Orchestration (packages/orchestration/package.json)**:
```json
{
  "name": "@dataprism/orchestration",
  "version": "0.1.0",
  "type": "module",
  "dependencies": {
    "@duckdb/duckdb-wasm": "^1.30.0",
    "apache-arrow": "^17.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Step 2: Core WASM Implementation

#### 2.1 Memory Manager Implementation
**File**: `packages/core/src/memory_manager.rs`
```rust
use wasm_bindgen::prelude::*;
use std::collections::HashMap;

#[wasm_bindgen]
pub struct MemoryManager {
    buffers: HashMap<u32, Vec<u8>>,
    next_id: u32,
}

#[wasm_bindgen]
impl MemoryManager {
    #[wasm_bindgen(constructor)]
    pub fn new() -> MemoryManager {
        console_error_panic_hook::set_once();
        MemoryManager {
            buffers: HashMap::new(),
            next_id: 0,
        }
    }

    #[wasm_bindgen]
    pub fn allocate_buffer(&mut self, size: usize) -> u32 {
        let buffer = Vec::with_capacity(size);
        let id = self.next_id;
        self.buffers.insert(id, buffer);
        self.next_id += 1;
        id
    }

    #[wasm_bindgen]
    pub fn get_buffer_ptr(&self, id: u32) -> *const u8 {
        self.buffers.get(&id)
            .map(|b| b.as_ptr())
            .unwrap_or(std::ptr::null())
    }

    #[wasm_bindgen]
    pub fn get_buffer_len(&self, id: u32) -> usize {
        self.buffers.get(&id)
            .map(|b| b.len())
            .unwrap_or(0)
    }

    #[wasm_bindgen]
    pub fn deallocate_buffer(&mut self, id: u32) -> bool {
        self.buffers.remove(&id).is_some()
    }
}
```

#### 2.2 Query Engine Interface
**File**: `packages/core/src/query_engine.rs`
```rust
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct QueryResult {
    #[wasm_bindgen(skip)]
    pub data: Vec<serde_json::Value>,
    pub row_count: u32,
    pub execution_time_ms: u32,
    pub memory_used_bytes: u32,
}

#[wasm_bindgen]
impl QueryResult {
    #[wasm_bindgen(getter)]
    pub fn data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.data).unwrap()
    }
}

#[wasm_bindgen]
pub struct QueryEngine {
    memory_manager: MemoryManager,
}

#[wasm_bindgen]
impl QueryEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> QueryEngine {
        QueryEngine {
            memory_manager: MemoryManager::new(),
        }
    }

    #[wasm_bindgen]
    pub async fn process_data(&mut self, data: &[u8]) -> Result<QueryResult, JsValue> {
        // Process data with optimized algorithms
        // This will interface with DuckDB through JavaScript
        let start_time = js_sys::Date::now();
        
        // Simulate processing - actual implementation would handle data transformation
        let processed_data = vec![
            serde_json::json!({"id": 1, "value": "processed"}),
            serde_json::json!({"id": 2, "value": "data"})
        ];
        
        let end_time = js_sys::Date::now();
        
        Ok(QueryResult {
            data: processed_data,
            row_count: 2,
            execution_time_ms: (end_time - start_time) as u32,
            memory_used_bytes: data.len() as u32,
        })
    }

    #[wasm_bindgen]
    pub fn get_memory_usage(&self) -> u32 {
        // Return current memory usage
        1024 // Placeholder
    }
}
```

#### 2.3 Main Library Interface
**File**: `packages/core/src/lib.rs`
```rust
mod memory_manager;
mod query_engine;
mod utils;

pub use memory_manager::MemoryManager;
pub use query_engine::{QueryEngine, QueryResult};
pub use utils::*;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen(start)]
pub fn main() {
    init_panic_hook();
    log("DataPrism Core WASM module initialized");
}
```

### Step 3: TypeScript Orchestration Layer

#### 3.1 DuckDB Integration Manager
**File**: `packages/orchestration/src/duckdb-manager.ts`
```typescript
import * as duckdb from '@duckdb/duckdb-wasm';
import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

export interface QueryMetadata {
  rowCount: number;
  executionTime: number;
  memoryUsage: number;
}

export interface QueryResult<T = any> {
  data: T[];
  metadata: QueryMetadata;
  error?: Error;
}

export class DuckDBManager {
  private db: AsyncDuckDB | null = null;
  private connection: AsyncDuckDBConnection | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
      
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
          type: 'text/javascript'
        })
      );

      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      this.connection = await this.db.connect();
      
      this.initialized = true;
      console.log('DuckDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DuckDB:', error);
      throw new Error(`DuckDB initialization failed: ${error}`);
    }
  }

  async query<T = any>(sql: string): Promise<QueryResult<T>> {
    if (!this.connection) {
      throw new Error('DuckDB not initialized');
    }

    const startTime = performance.now();
    
    try {
      const result = await this.connection.query(sql);
      const endTime = performance.now();
      
      const data = result.toArray().map(row => row.toJSON()) as T[];
      
      return {
        data,
        metadata: {
          rowCount: data.length,
          executionTime: endTime - startTime,
          memoryUsage: this.getMemoryUsage()
        }
      };
    } catch (error) {
      const endTime = performance.now();
      console.error('Query execution failed:', error);
      
      return {
        data: [],
        metadata: {
          rowCount: 0,
          executionTime: endTime - startTime,
          memoryUsage: this.getMemoryUsage()
        },
        error: error as Error
      };
    }
  }

  async insertData(tableName: string, data: any[]): Promise<void> {
    if (!this.connection) {
      throw new Error('DuckDB not initialized');
    }

    try {
      // Create table from data structure
      await this.connection.insertJSONFromPath(tableName, {
        data: data
      });
    } catch (error) {
      console.error('Data insertion failed:', error);
      throw error;
    }
  }

  private getMemoryUsage(): number {
    // Estimate memory usage - in real implementation, this would be more sophisticated
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    if (this.db) {
      await this.db.terminate();
      this.db = null;
    }
    this.initialized = false;
  }
}
```

#### 3.2 Core Engine Orchestrator
**File**: `packages/orchestration/src/engine.ts`
```typescript
import { DuckDBManager, QueryResult } from './duckdb-manager.js';

// Import WASM module - will be generated by wasm-pack
import init, { QueryEngine as WasmQueryEngine, init_panic_hook } from '../../../packages/core/pkg/dataprism_core.js';

export interface DataPrismConfig {
  enableWasmOptimizations: boolean;
  maxMemoryMB: number;
  queryTimeoutMs: number;
}

export class DataPrismEngine {
  private duckdb: DuckDBManager;
  private wasmEngine: WasmQueryEngine | null = null;
  private config: DataPrismConfig;
  private initialized = false;

  constructor(config: Partial<DataPrismConfig> = {}) {
    this.config = {
      enableWasmOptimizations: true,
      maxMemoryMB: 4096,
      queryTimeoutMs: 30000,
      ...config
    };
    this.duckdb = new DuckDBManager();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize WASM module
      await init();
      init_panic_hook();
      this.wasmEngine = new WasmQueryEngine();

      // Initialize DuckDB
      await this.duckdb.initialize();

      this.initialized = true;
      console.log('DataPrism Engine initialized successfully');
    } catch (error) {
      console.error('Engine initialization failed:', error);
      throw error;
    }
  }

  async query(sql: string): Promise<QueryResult> {
    if (!this.initialized) {
      throw new Error('Engine not initialized');
    }

    const startTime = performance.now();

    try {
      // Route query through DuckDB for analytical processing
      const result = await this.duckdb.query(sql);
      
      // Apply WASM optimizations if enabled and beneficial
      if (this.config.enableWasmOptimizations && this.shouldUseWasmOptimization(result)) {
        return await this.applyWasmOptimizations(result);
      }

      return result;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  async loadData(data: any[], tableName: string = 'main_table'): Promise<void> {
    if (!this.initialized) {
      throw new Error('Engine not initialized');
    }

    try {
      await this.duckdb.insertData(tableName, data);
      console.log(`Loaded ${data.length} rows into table ${tableName}`);
    } catch (error) {
      console.error('Data loading failed:', error);
      throw error;
    }
  }

  private shouldUseWasmOptimization(result: QueryResult): boolean {
    // Determine if WASM optimizations would be beneficial
    // For example, large result sets or complex transformations
    return result.data.length > 1000 || result.metadata.executionTime > 1000;
  }

  private async applyWasmOptimizations(result: QueryResult): Promise<QueryResult> {
    if (!this.wasmEngine) {
      return result;
    }

    try {
      // Convert data to bytes for WASM processing
      const dataBytes = new TextEncoder().encode(JSON.stringify(result.data));
      
      // Process through WASM engine
      const wasmResult = await this.wasmEngine.process_data(dataBytes);
      
      return {
        data: JSON.parse(wasmResult.data.toString()),
        metadata: {
          rowCount: wasmResult.row_count,
          executionTime: result.metadata.executionTime + wasmResult.execution_time_ms,
          memoryUsage: Math.max(result.metadata.memoryUsage, wasmResult.memory_used_bytes)
        }
      };
    } catch (error) {
      console.warn('WASM optimization failed, falling back to original result:', error);
      return result;
    }
  }

  getMemoryUsage(): number {
    if (!this.wasmEngine) return 0;
    return this.wasmEngine.get_memory_usage();
  }

  async close(): Promise<void> {
    await this.duckdb.close();
    this.wasmEngine = null;
    this.initialized = false;
  }
}
```

#### 3.3 Public API Interface
**File**: `packages/orchestration/src/index.ts`
```typescript
export { DataPrismEngine, type DataPrismConfig } from './engine.js';
export { DuckDBManager, type QueryResult, type QueryMetadata } from './duckdb-manager.js';
export type { QueryResult as WasmQueryResult } from '../../../packages/core/pkg/dataprism_core.js';

// Re-export for convenience
export * from './types.js';
```

#### 3.4 Type Definitions
**File**: `packages/orchestration/src/types.ts`
```typescript
export interface DataPrismError {
  message: string;
  code: string;
  source: 'wasm' | 'duckdb' | 'orchestration';
}

export interface PerformanceMetrics {
  queryCount: number;
  totalExecutionTime: number;
  averageResponseTime: number;
  memoryPeakUsage: number;
  cacheHitRate?: number;
}

export interface EngineStatus {
  initialized: boolean;
  wasmModuleLoaded: boolean;
  duckdbConnected: boolean;
  memoryUsage: number;
  uptime: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
```

### Step 4: Error Handling and Validation

#### 4.1 Rust Error Handling
**File**: `packages/core/src/utils.rs`
```rust
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct DataPrismError {
    message: String,
    error_type: String,
    code: u32,
}

#[wasm_bindgen]
impl DataPrismError {
    #[wasm_bindgen(constructor)]
    pub fn new(message: &str, error_type: &str, code: u32) -> DataPrismError {
        DataPrismError {
            message: message.to_string(),
            error_type: error_type.to_string(),
            code,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn message(&self) -> String {
        self.message.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn error_type(&self) -> String {
        self.error_type.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn code(&self) -> u32 {
        self.code
    }
}

#[wasm_bindgen]
pub fn validate_input_data(data: &[u8]) -> Result<bool, JsValue> {
    // Validate input data format and size
    if data.is_empty() {
        return Err(JsValue::from_str("Input data cannot be empty"));
    }
    
    if data.len() > 100_000_000 { // 100MB limit
        return Err(JsValue::from_str("Input data exceeds maximum size limit"));
    }
    
    Ok(true)
}

#[wasm_bindgen]
pub fn log_performance_metric(operation: &str, duration_ms: f64, memory_bytes: u32) {
    web_sys::console::log_3(
        &format!("Performance: {}", operation).into(),
        &format!("Duration: {}ms", duration_ms).into(),
        &format!("Memory: {}MB", memory_bytes as f64 / 1_000_000.0).into(),
    );
}
```

#### 4.2 TypeScript Error Handling
**File**: `packages/orchestration/src/error-handler.ts`
```typescript
import { DataPrismError } from './types.js';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: DataPrismError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: unknown, source: 'wasm' | 'duckdb' | 'orchestration'): DataPrismError {
    const dataPrismError: DataPrismError = {
      message: error instanceof Error ? error.message : String(error),
      code: this.generateErrorCode(source),
      source
    };

    this.errorLog.push(dataPrismError);
    console.error(`DataPrism Error [${source}]:`, dataPrismError);

    return dataPrismError;
  }

  private generateErrorCode(source: string): string {
    const timestamp = Date.now();
    const prefix = source.toUpperCase().slice(0, 3);
    return `${prefix}_${timestamp}`;
  }

  getErrorHistory(): DataPrismError[] {
    return [...this.errorLog];
  }

  clearErrorHistory(): void {
    this.errorLog = [];
  }
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const errorHandler = ErrorHandler.getInstance();
  errorHandler.handleError(event.reason, 'orchestration');
});
```

### Step 5: Testing and Build Configuration

#### 5.1 Build Configuration
**Root package.json**:
```json
{
  "name": "dataprism-core",
  "version": "0.1.0",
  "type": "module",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build:core && npm run build:orchestration",
    "build:core": "cd packages/core && wasm-pack build --target web --out-dir pkg",
    "build:orchestration": "cd packages/orchestration && npm run build",
    "test": "npm run test:core && npm run test:orchestration",
    "test:core": "cd packages/core && cargo test",
    "test:orchestration": "cd packages/orchestration && npm test",
    "test:integration": "npm run test:browser",
    "test:browser": "npm run build && node tests/integration/browser-test.js",
    "test:performance": "node tests/performance/benchmark.js",
    "lint": "npm run lint:rust && npm run lint:ts",
    "lint:rust": "cd packages/core && cargo clippy",
    "lint:ts": "cd packages/orchestration && npm run lint",
    "format": "npm run format:rust && npm run format:ts",
    "format:rust": "cd packages/core && cargo fmt",
    "format:ts": "cd packages/orchestration && npm run format"
  },
  "devDependencies": {
    "playwright": "^1.40.0",
    "vitest": "^1.0.0"
  }
}
```

#### 5.2 Rust Tests
**File**: `packages/core/src/lib.rs` (test module)
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_memory_manager_allocation() {
        let mut manager = MemoryManager::new();
        let buffer_id = manager.allocate_buffer(1024);
        assert_eq!(manager.get_buffer_len(buffer_id), 0);
        assert!(manager.deallocate_buffer(buffer_id));
    }

    #[wasm_bindgen_test]
    async fn test_query_engine_basic() {
        let mut engine = QueryEngine::new();
        let test_data = b"test data";
        
        match engine.process_data(test_data).await {
            Ok(result) => {
                assert!(result.row_count > 0);
                assert!(result.execution_time_ms >= 0);
            }
            Err(e) => panic!("Query processing failed: {:?}", e),
        }
    }

    #[test]
    fn test_input_validation() {
        assert!(validate_input_data(&[1, 2, 3]).is_ok());
        assert!(validate_input_data(&[]).is_err());
        
        let large_data = vec![0u8; 200_000_000];
        assert!(validate_input_data(&large_data).is_err());
    }
}
```

#### 5.3 TypeScript Tests
**File**: `packages/orchestration/tests/engine.test.ts`
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DataPrismEngine } from '../src/engine.js';

describe('DataPrismEngine', () => {
  let engine: DataPrismEngine;

  beforeEach(async () => {
    engine = new DataPrismEngine({
      enableWasmOptimizations: true,
      maxMemoryMB: 1024,
      queryTimeoutMs: 10000
    });
    await engine.initialize();
  });

  afterEach(async () => {
    await engine.close();
  });

  it('should initialize successfully', async () => {
    expect(engine).toBeDefined();
  });

  it('should load and query data', async () => {
    const testData = [
      { id: 1, name: 'Alice', value: 100 },
      { id: 2, name: 'Bob', value: 200 },
      { id: 3, name: 'Charlie', value: 300 }
    ];

    await engine.loadData(testData, 'test_table');
    
    const result = await engine.query('SELECT * FROM test_table WHERE value > 150');
    
    expect(result.data).toHaveLength(2);
    expect(result.metadata.rowCount).toBe(2);
    expect(result.metadata.executionTime).toBeGreaterThan(0);
  });

  it('should handle query errors gracefully', async () => {
    await expect(engine.query('INVALID SQL SYNTAX')).rejects.toThrow();
  });

  it('should meet performance targets', async () => {
    const testData = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: Math.random() * 1000
    }));

    await engine.loadData(testData, 'perf_test');
    
    const startTime = performance.now();
    const result = await engine.query('SELECT COUNT(*) as count FROM perf_test');
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(2000); // <2 seconds
    expect(result.data[0].count).toBe(10000);
  });
});
```

#### 5.4 Integration Tests
**File**: `tests/integration/browser-test.js`
```javascript
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBrowserTests() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Serve the built files
  const testHtmlPath = join(__dirname, 'test.html');
  await page.goto(`file://${testHtmlPath}`);
  
  // Test engine initialization
  const initResult = await page.evaluate(async () => {
    const { DataPrismEngine } = await import('../../packages/orchestration/dist/index.js');
    const engine = new DataPrismEngine();
    
    try {
      await engine.initialize();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  console.log('Browser initialization test:', initResult);
  
  // Test query performance
  const perfResult = await page.evaluate(async () => {
    const { DataPrismEngine } = await import('../../packages/orchestration/dist/index.js');
    const engine = new DataPrismEngine();
    await engine.initialize();
    
    const testData = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: i * 2 }));
    await engine.loadData(testData);
    
    const startTime = performance.now();
    const result = await engine.query('SELECT COUNT(*) FROM main_table');
    const endTime = performance.now();
    
    return {
      executionTime: endTime - startTime,
      rowCount: result.data[0]['COUNT(*)'],
      success: true
    };
  });
  
  console.log('Performance test:', perfResult);
  
  await browser.close();
  
  // Validate results
  if (!initResult.success) {
    throw new Error(`Initialization failed: ${initResult.error}`);
  }
  
  if (perfResult.executionTime > 2000) {
    throw new Error(`Performance target not met: ${perfResult.executionTime}ms > 2000ms`);
  }
  
  console.log('All browser tests passed!');
}

runBrowserTests().catch(console.error);
```

## Testing Strategy

### Unit Tests
- **Rust Tests**: Using `wasm-bindgen-test` for WASM-specific testing
- **TypeScript Tests**: Using Vitest for comprehensive unit testing
- **Coverage Target**: >90% for all public APIs

### Integration Tests
- **WASM-JavaScript Interop**: Validate data exchange between layers
- **DuckDB Integration**: Test query execution and data loading
- **Memory Management**: Validate allocation and deallocation patterns

### Performance Tests
- **Query Response Time**: Ensure <2 seconds for 95% of operations
- **Memory Usage**: Validate <4GB limit for 1M row datasets
- **Initialization Time**: Ensure <5 seconds startup
- **Concurrent Operations**: Test multiple simultaneous queries

### Browser Compatibility Tests
- **Target Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebAssembly Support**: Validate MVP specification compliance
- **Memory Pressure**: Test behavior under low memory conditions

## Success Criteria

### Functional Requirements
- ✅ WASM module compiles and loads successfully
- ✅ DuckDB integration performs analytical queries
- ✅ TypeScript orchestration layer coordinates operations
- ✅ Error handling works across language boundaries
- ✅ Memory management prevents leaks

### Performance Requirements
- ✅ Query response time <2 seconds (95% of operations)
- ✅ Memory usage <4GB for 1M row datasets
- ✅ Initialization time <5 seconds
- ✅ WASM bundle size <6MB

### Quality Requirements
- ✅ Unit test coverage >90%
- ✅ Integration tests passing
- ✅ Performance benchmarks met
- ✅ Browser compatibility verified
- ✅ Code follows established patterns

## Validation Commands

### Build Validation
```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Verify WASM compilation
cd packages/core && wasm-pack build --target web --out-dir pkg

# Verify TypeScript compilation
cd packages/orchestration && npm run build
```

### Test Validation
```bash
# Run all tests
npm test

# Run unit tests
npm run test:core      # Rust tests
npm run test:orchestration  # TypeScript tests

# Run integration tests
npm run test:integration

# Run performance benchmarks
npm run test:performance
```

### Code Quality Validation
```bash
# Lint all code
npm run lint

# Format all code
npm run format

# Type checking
cd packages/orchestration && npm run type-check

# Rust specific checks
cd packages/core && cargo clippy
```

### Performance Validation
```bash
# Run performance benchmarks
npm run test:performance

# Memory usage analysis
node tests/performance/memory-analysis.js

# Browser compatibility testing
npm run test:browser
```

## Documentation Requirements

### Code Documentation
- TSDoc comments for all public TypeScript interfaces
- Rust documentation for all public functions
- Clear examples for complex functionality

### API Documentation
- Comprehensive API reference
- Usage examples for all major features
- Performance characteristics documentation

### Integration Examples
- Basic usage examples
- Advanced integration patterns
- Performance optimization guides

## Deployment Considerations

### Bundle Optimization
- WASM module size optimization
- Tree shaking for unused code
- Compression and caching strategies

### Browser Distribution
- CDN distribution setup
- Progressive loading strategies
- Fallback mechanisms for unsupported browsers

### Monitoring and Analytics
- Performance monitoring integration
- Error tracking and reporting
- Usage analytics for optimization

## Next Steps and Future Enhancements

### Phase 2: LLM Integration
- Multi-provider LLM support
- Intelligent query optimization
- Natural language to SQL translation

### Phase 3: Plugin System
- Extensible plugin architecture
- Custom data processors
- Third-party integrations

### Phase 4: Advanced Analytics
- Machine learning integration
- Real-time streaming analytics
- Advanced visualization capabilities

---

This PRP provides a comprehensive foundation for implementing the DataPrism Core analytics engine. The implementation follows established patterns, includes comprehensive testing strategies, and provides clear validation criteria for successful delivery.