import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { QueryMetadata, QueryResult, DataPrismError } from "./types.js";
import { ErrorHandler } from "./error-handler.js";
import { DuckDBCDNLoader } from "./duckdb-cdn-loader.js";

export class DuckDBManager {
  private db: AsyncDuckDB | null = null;
  private connection: AsyncDuckDBConnection | null = null;
  private initialized = false;
  private errorHandler = ErrorHandler.getInstance();
  private cdnLoader: DuckDBCDNLoader;

  constructor(cdnBaseUrl?: string) {
    this.cdnLoader = new DuckDBCDNLoader(cdnBaseUrl);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Use CDN loader which handles both CDN and JSDelivr fallback
      this.db = await this.cdnLoader.createDuckDB();
      this.connection = await this.db.connect();

      this.initialized = true;
      console.log("DuckDB initialized successfully");
    } catch (error) {
      const dataPrismError = this.errorHandler.handleError(error, "duckdb");
      throw new Error(
        `DuckDB initialization failed: ${dataPrismError.message}`,
      );
    }
  }

  async query<T = any>(sql: string): Promise<QueryResult<T>> {
    if (!this.connection) {
      throw new Error("DuckDB not initialized");
    }

    const startTime = performance.now();

    try {
      const result = await this.connection.query(sql);
      const endTime = performance.now();

      const data = result.toArray().map((row) => row.toJSON()) as T[];

      return {
        data,
        metadata: {
          rowCount: data.length,
          executionTime: endTime - startTime,
          memoryUsage: this.getMemoryUsage(),
        },
      };
    } catch (error) {
      const endTime = performance.now();
      const dataPrismError = this.errorHandler.handleError(error, "duckdb");

      return {
        data: [],
        metadata: {
          rowCount: 0,
          executionTime: endTime - startTime,
          memoryUsage: this.getMemoryUsage(),
        },
        error: dataPrismError,
      };
    }
  }

  async insertData(tableName: string, data: any[]): Promise<void> {
    if (!this.connection) {
      throw new Error("DuckDB not initialized");
    }

    try {
      // Drop table if it exists
      await this.connection.query(`DROP TABLE IF EXISTS ${tableName}`);

      // Register data as a table
      await this.db!.registerFileText(
        `${tableName}.json`,
        JSON.stringify(data),
      );

      // Create table from JSON file
      await this.connection.query(`
        CREATE TABLE ${tableName} AS 
        SELECT * FROM read_json_auto('${tableName}.json')
      `);

      console.log(
        `Successfully loaded ${data.length} rows into table ${tableName}`,
      );
    } catch (error) {
      this.errorHandler.handleError(error, "duckdb");
      throw error;
    }
  }

  async createTable(
    tableName: string,
    schema: Record<string, string>,
  ): Promise<void> {
    if (!this.connection) {
      throw new Error("DuckDB not initialized");
    }

    try {
      const columns = Object.entries(schema)
        .map(([name, type]) => `${name} ${type}`)
        .join(", ");

      await this.connection.query(`CREATE TABLE ${tableName} (${columns})`);
    } catch (error) {
      this.errorHandler.handleError(error, "duckdb");
      throw error;
    }
  }

  async listTables(): Promise<string[]> {
    if (!this.connection) {
      throw new Error("DuckDB not initialized");
    }

    try {
      const result = await this.connection.query("SHOW TABLES");
      return result.toArray().map((row) => row.toJSON()["name"] as string);
    } catch (error) {
      this.errorHandler.handleError(error, "duckdb");
      return [];
    }
  }

  async getTableInfo(tableName: string): Promise<any[]> {
    if (!this.connection) {
      throw new Error("DuckDB not initialized");
    }

    try {
      const result = await this.connection.query(`DESCRIBE ${tableName}`);
      return result.toArray().map((row) => row.toJSON());
    } catch (error) {
      this.errorHandler.handleError(error, "duckdb");
      return [];
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

  isInitialized(): boolean {
    return this.initialized;
  }
}
