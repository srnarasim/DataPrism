export { DataPrismEngine } from "./engine.js";
export { DuckDBManager } from "./duckdb-manager.js";
export { ErrorHandler } from "./error-handler.js";

export type {
  DataPrismConfig,
  QueryResult,
  QueryMetadata,
  DataPrismError,
  PerformanceMetrics,
  EngineStatus,
  Logger,
  LogLevel,
} from "./types.js";

// Version information
export const version = "0.1.0";
export const name = "DataPrism Core";

// Re-export classes
import { DataPrismEngine } from "./engine.js";
import type { DataPrismConfig } from "./types.js";

// Utility functions
export function createEngine(config?: Partial<DataPrismConfig>) {
  return new DataPrismEngine(config);
}

// Export for convenience
export default DataPrismEngine;
