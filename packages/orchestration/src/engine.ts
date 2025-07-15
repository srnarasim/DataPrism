import { DuckDBManager } from "./duckdb-manager.js";
import {
  QueryResult,
  DataPrismConfig,
  EngineStatus,
  PerformanceMetrics,
} from "./types.js";
import { ErrorHandler } from "./error-handler.js";
import { DependencyRegistry } from "./dependency-registry.js";
import { ArrowLoader } from "./arrow-loader.js";

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
  private dependencyRegistry = DependencyRegistry.getInstance();
  private arrowLoader = ArrowLoader.getInstance();
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
      // Initialize dependencies in parallel for better performance
      const initPromises = [];

      // Initialize DuckDB
      initPromises.push(
        this.dependencyRegistry.loadDependency(
          "duckdb",
          () => this.duckdb.initialize(),
          { timeout: 30000, maxRetries: 3 }
        )
      );

      // Initialize Arrow
      initPromises.push(
        this.arrowLoader.loadArrow().catch(error => {
          this.log("warn", `Arrow initialization failed: ${error.message}`);
          return null;
        })
      );

      // Initialize WASM module if available
      if (this.config.enableWasmOptimizations) {
        initPromises.push(
          this.dependencyRegistry.loadDependency(
            "wasm-core",
            () => this.initializeWasm(),
            { timeout: 20000, maxRetries: 2 }
          ).catch(error => {
            this.log("warn", `WASM initialization failed: ${error.message}`);
            this.config.enableWasmOptimizations = false;
            return null;
          })
        );
      }

      // Wait for all dependencies to load
      await Promise.allSettled(initPromises);

      this.initialized = true;
      this.log("info", "DataPrism Engine initialized successfully");
      
      // Log dependency status
      this.logDependencyStatus();
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
      dependencies: this.getDependencyStatus(),
      dependencyHealth: this.getDependencyHealth(),
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

  async waitForReady(dependencies?: string[], timeoutMs: number = 30000): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.dependencyRegistry.waitForReady(dependencies, timeoutMs);
      this.log("info", "All dependencies are ready");
    } catch (error) {
      const healthStatus = this.dependencyRegistry.getHealthStatus();
      this.log("error", `Dependency readiness check failed. Health: ${healthStatus.healthScore}%`);
      throw error;
    }
  }

  async waitForDuckDB(timeoutMs: number = 30000): Promise<void> {
    await this.dependencyRegistry.waitForDependency("duckdb", timeoutMs);
  }

  async waitForArrow(timeoutMs: number = 30000): Promise<void> {
    await this.arrowLoader.waitForArrow(timeoutMs);
  }

  async waitForWasm(timeoutMs: number = 20000): Promise<void> {
    if (this.config.enableWasmOptimizations) {
      await this.dependencyRegistry.waitForDependency("wasm-core", timeoutMs);
    }
  }

  async preloadDependencies(dependencies: string[] = []): Promise<void> {
    const targetDeps = dependencies.length > 0 ? dependencies : ["duckdb", "apache-arrow"];
    
    if (this.config.enableWasmOptimizations) {
      targetDeps.push("wasm-core");
    }

    try {
      await this.dependencyRegistry.preloadDependencies(targetDeps);
      this.log("info", `Preloaded dependencies: ${targetDeps.join(", ")}`);
    } catch (error) {
      this.log("warn", `Failed to preload some dependencies: ${error}`);
    }
  }

  isReady(): boolean {
    return this.initialized && this.dependencyRegistry.isDependencyReady("duckdb");
  }

  getDependencyStatus(): {
    duckdb: boolean;
    arrow: boolean;
    wasm: boolean;
    overall: boolean;
  } {
    return {
      duckdb: this.dependencyRegistry.isDependencyReady("duckdb"),
      arrow: this.arrowLoader.isArrowReady(),
      wasm: this.config.enableWasmOptimizations ? 
        this.dependencyRegistry.isDependencyReady("wasm-core") : true,
      overall: this.isReady(),
    };
  }

  getDependencyHealth(): any {
    return this.dependencyRegistry.getHealthStatus();
  }

  private logDependencyStatus(): void {
    const status = this.getDependencyStatus();
    const health = this.getDependencyHealth();
    
    this.log("info", `Dependency Status - DuckDB: ${status.duckdb}, Arrow: ${status.arrow}, WASM: ${status.wasm}`);
    this.log("info", `Overall Health Score: ${health.healthScore}%`);
    
    if (health.errorCount > 0) {
      const failedDeps = this.dependencyRegistry.getFailedDependencies();
      this.log("warn", `Failed dependencies: ${failedDeps.join(", ")}`);
    }
  }

  async close(): Promise<void> {
    await this.duckdb.close();
    this.wasmEngine = null;
    this.wasmModule = null;
    this.initialized = false;
    this.dependencyRegistry.clearAll();
    this.log("info", "DataPrism Engine closed");
  }
}
