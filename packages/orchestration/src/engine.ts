import { DuckDBManager } from "./duckdb-manager.js";
import {
  QueryResult,
  DataPrismConfig,
  EngineStatus,
  PerformanceMetrics,
} from "./types.js";
import { ErrorHandler } from "./error-handler.js";

// WASM module will be available after build
interface WasmModule {
  QueryEngine: any;
  init_panic_hook: () => void;
  get_version: () => string;
  get_build_info: () => any;
}

export class DataPrismEngine {
  private duckdb: DuckDBManager;
  private wasmEngine: any = null;
  private wasmModule: WasmModule | null = null;
  private config: DataPrismConfig;
  private initialized = false;
  private startTime = Date.now();
  private errorHandler = ErrorHandler.getInstance();
  private metrics: PerformanceMetrics = {
    queryCount: 0,
    totalExecutionTime: 0,
    averageResponseTime: 0,
    memoryPeakUsage: 0,
  };

  constructor(config: Partial<DataPrismConfig> = {}) {
    this.config = {
      enableWasmOptimizations: true,
      maxMemoryMB: 4096,
      queryTimeoutMs: 30000,
      logLevel: "info",
      ...config,
    };
    this.duckdb = new DuckDBManager();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize DuckDB first
      await this.duckdb.initialize();
      this.log("info", "DuckDB initialized successfully");

      // Try to initialize WASM module if available
      try {
        await this.initializeWasm();
        this.log("info", "WASM module initialized successfully");
      } catch (wasmError) {
        this.log(
          "warn",
          "WASM module not available, continuing without WASM optimizations",
        );
        this.config.enableWasmOptimizations = false;
      }

      this.initialized = true;
      this.log("info", "DataPrism Engine initialized successfully");
    } catch (error) {
      this.errorHandler.handleError(error, "orchestration");
      throw error;
    }
  }

  private async initializeWasm(): Promise<void> {
    // Skip WASM initialization during build process
    if (typeof window === "undefined") {
      throw new Error("WASM not available in Node environment");
    }

    try {
      // Dynamic import the WASM module - construct path dynamically to avoid TS resolution
      const corePackageName = "@dataprism/core";
      const wasmModule = await import(/* @vite-ignore */ corePackageName);

      // Try to initialize with public WASM file first, then fallback
      try {
        await wasmModule.default("/wasm/dataprism_core_bg.wasm");
      } catch (error) {
        // Fallback to default initialization
        await wasmModule.default();
      }

      wasmModule.init_panic_hook();

      this.wasmModule = wasmModule;
      this.wasmEngine = new wasmModule.QueryEngine();

      this.log("info", `WASM module version: ${wasmModule.get_version()}`);
    } catch (error) {
      throw new Error(`WASM initialization failed: ${error}`);
    }
  }

  async query(sql: string): Promise<QueryResult> {
    if (!this.initialized) {
      throw new Error("Engine not initialized");
    }

    const startTime = performance.now();
    this.metrics.queryCount++;

    try {
      // Route query through DuckDB for analytical processing
      const result = await this.duckdb.query(sql);

      // Apply WASM optimizations if enabled and beneficial
      if (
        this.config.enableWasmOptimizations &&
        this.wasmEngine &&
        this.shouldUseWasmOptimization(result)
      ) {
        return await this.applyWasmOptimizations(result);
      }

      this.updateMetrics(
        performance.now() - startTime,
        result.metadata.memoryUsage,
      );
      return result;
    } catch (error) {
      this.errorHandler.handleError(error, "orchestration");
      throw error;
    }
  }

  async loadData(data: any[], tableName: string = "main_table"): Promise<void> {
    if (!this.initialized) {
      throw new Error("Engine not initialized");
    }

    try {
      await this.duckdb.insertData(tableName, data);
      this.log("info", `Loaded ${data.length} rows into table ${tableName}`);
    } catch (error) {
      this.errorHandler.handleError(error, "orchestration");
      throw error;
    }
  }

  async createTable(
    tableName: string,
    schema: Record<string, string>,
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error("Engine not initialized");
    }

    await this.duckdb.createTable(tableName, schema);
  }

  async listTables(): Promise<string[]> {
    if (!this.initialized) {
      throw new Error("Engine not initialized");
    }

    return await this.duckdb.listTables();
  }

  async getTableInfo(tableName: string): Promise<any[]> {
    if (!this.initialized) {
      throw new Error("Engine not initialized");
    }

    return await this.duckdb.getTableInfo(tableName);
  }

  private shouldUseWasmOptimization(result: QueryResult): boolean {
    // Determine if WASM optimizations would be beneficial
    // For example, large result sets or complex transformations
    return result.data.length > 1000 || result.metadata.executionTime > 1000;
  }

  private async applyWasmOptimizations(
    result: QueryResult,
  ): Promise<QueryResult> {
    if (!this.wasmEngine) {
      return result;
    }

    try {
      // Convert data to bytes for WASM processing
      const dataBytes = new TextEncoder().encode(JSON.stringify(result.data));

      // Process through WASM engine
      const wasmResult = await this.wasmEngine.process_data(dataBytes);

      return {
        data: JSON.parse(wasmResult.data),
        metadata: {
          rowCount: wasmResult.row_count,
          executionTime:
            result.metadata.executionTime + wasmResult.execution_time_ms,
          memoryUsage: Math.max(
            result.metadata.memoryUsage,
            wasmResult.memory_used_bytes,
          ),
        },
      };
    } catch (error) {
      this.log(
        "warn",
        `WASM optimization failed, falling back to original result: ${error}`,
      );
      return result;
    }
  }

  private updateMetrics(executionTime: number, memoryUsage: number): void {
    this.metrics.totalExecutionTime += executionTime;
    this.metrics.averageResponseTime =
      this.metrics.totalExecutionTime / this.metrics.queryCount;
    this.metrics.memoryPeakUsage = Math.max(
      this.metrics.memoryPeakUsage,
      memoryUsage,
    );
  }

  getMemoryUsage(): number {
    if (this.wasmEngine) {
      return this.wasmEngine.get_memory_usage();
    }
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getStatus(): EngineStatus {
    return {
      initialized: this.initialized,
      wasmModuleLoaded: !!this.wasmModule,
      duckdbConnected: this.duckdb.isInitialized(),
      memoryUsage: this.getMemoryUsage(),
      uptime: Date.now() - this.startTime,
    };
  }

  getVersion(): string {
    return this.wasmModule?.get_version() || "0.1.0";
  }

  getBuildInfo(): any {
    return (
      this.wasmModule?.get_build_info() || {
        version: "0.1.0",
        source: "typescript",
      }
    );
  }

  private log(level: string, message: string): void {
    if (
      this.config.logLevel === "debug" ||
      (this.config.logLevel === "info" && level !== "debug") ||
      (this.config.logLevel === "warn" &&
        (level === "warn" || level === "error")) ||
      (this.config.logLevel === "error" && level === "error")
    ) {
      console.log(`[DataPrism:${level.toUpperCase()}] ${message}`);
    }
  }

  async close(): Promise<void> {
    await this.duckdb.close();
    this.wasmEngine = null;
    this.wasmModule = null;
    this.initialized = false;
    this.log("info", "DataPrism Engine closed");
  }
}
