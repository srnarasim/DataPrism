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

export interface QueryMetadata {
  rowCount: number;
  executionTime: number;
  memoryUsage: number;
}

export interface QueryResult<T = any> {
  data: T[];
  metadata: QueryMetadata;
  error?: DataPrismError;
}

export interface DataPrismConfig {
  enableWasmOptimizations: boolean;
  maxMemoryMB: number;
  queryTimeoutMs: number;
  logLevel?: LogLevel;
  duckdbConfig?: {
    maxThreads?: number;
    maxMemory?: string;
  };
}