import {
  IIntegrationPlugin,
  PluginContext,
  PluginManifest,
  PluginCapability,
  Dataset,
  DataType,
} from "@dataprism/plugins";
import Papa from "papaparse";
import {
  WorkerManager,
  WorkerTask,
  WorkerResult,
} from "@shared/worker-manager.js";
import { DataUtils, TypeInferenceResult } from "@shared/data-utils.js";
import { PerformanceTracker } from "@shared/performance-tracker.js";

export interface CSVImportConfig {
  delimiter?: string;
  quote?: string;
  escape?: string;
  encoding?: "UTF-8" | "UTF-16" | "Latin-1";
  hasHeader?: boolean;
  skipRows?: number;
  maxRows?: number;
  autoDetectTypes?: boolean;
  strictParsing?: boolean;
  chunkSize?: number;
  previewRows?: number;
}

export interface ImportProgress {
  phase: "analyzing" | "parsing" | "validating" | "importing" | "complete";
  percentage: number;
  rowsProcessed: number;
  totalRows?: number;
  errors: ImportError[];
  warnings: string[];
  estimatedTimeRemaining?: number;
}

export interface ImportError {
  row: number;
  column: number;
  field: string;
  value: any;
  message: string;
  severity: "error" | "warning";
}

export interface SchemaPreview {
  columns: ColumnPreview[];
  sampleData: any[][];
  totalRows: number;
  encoding: string;
  delimiter: string;
  hasHeader: boolean;
}

export interface ColumnPreview {
  index: number;
  name: string;
  inferredType: DataType;
  confidence: number;
  samples: any[];
  nullCount: number;
  uniqueCount: number;
}

export class CSVImporterPlugin implements IIntegrationPlugin {
  private context: PluginContext | null = null;
  private workerManager: WorkerManager;
  private performanceTracker: PerformanceTracker;
  private currentImport: AbortController | null = null;

  constructor() {
    this.workerManager = new WorkerManager({
      maxWorkers: 2,
      maxQueueSize: 50,
      terminateTimeout: 5000,
    });
    this.performanceTracker = new PerformanceTracker({
      maxMemoryMB: 2000,
      minFps: 30,
      maxQueryTimeMs: 10000,
      maxCpuPercent: 80,
    });
  }

  // Plugin Identity
  getName(): string {
    return "CSVImporter";
  }

  getVersion(): string {
    return "1.0.0";
  }

  getDescription(): string {
    return "Stream large CSV/TSV files directly into DuckDB-WASM with automatic type inference and data quality metrics";
  }

  getAuthor(): string {
    return "DataPrism Team";
  }

  getDependencies() {
    return [{ name: "papaparse", version: "^5.4.1", optional: false }];
  }

  // Lifecycle Management
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;

    // Initialize worker manager with CSV parsing worker
    await this.workerManager.initialize("/workers/csv-parser-worker.js");

    this.performanceTracker.start();
    this.context.logger.info("CSVImporter plugin initialized");
  }

  async activate(): Promise<void> {
    if (!this.context) throw new Error("Plugin not initialized");
    this.context.logger.info("CSVImporter plugin activated");
  }

  async deactivate(): Promise<void> {
    if (this.currentImport) {
      this.currentImport.abort();
      this.currentImport = null;
    }
    this.context?.logger.info("CSVImporter plugin deactivated");
  }

  async cleanup(): Promise<void> {
    await this.workerManager.terminate();
    this.performanceTracker.stop();
    this.context?.logger.info("CSVImporter plugin cleaned up");
  }

  // Core Operations
  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case "preview":
        return this.previewFile(params.file, params.config);
      case "import":
        return this.importFile(params.file, params.config, params.onProgress);
      case "detectDelimiter":
        return this.detectDelimiter(params.sample);
      case "inferSchema":
        return this.inferSchema(params.data, params.headers);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async configure(settings: any): Promise<void> {
    // Configure worker pool settings if provided
    if (settings.workerConfig) {
      await this.workerManager.terminate();
      this.workerManager = new WorkerManager(settings.workerConfig);
      await this.workerManager.initialize("/workers/csv-parser-worker.js");
    }
  }

  // Metadata and Capabilities
  getManifest(): PluginManifest {
    return {
      name: this.getName(),
      version: this.getVersion(),
      description: this.getDescription(),
      author: this.getAuthor(),
      license: "MIT",
      keywords: ["import", "csv", "data", "streaming"],
      category: "integration",
      entryPoint: "csv-importer.js",
      dependencies: this.getDependencies(),
      permissions: [
        { resource: "files", access: "read" },
        { resource: "workers", access: "execute" },
        { resource: "memory", access: "write" },
      ],
      configuration: {
        chunkSize: { type: "number", default: 10000 },
        maxFileSize: { type: "number", default: 4294967296 }, // 4GB
        autoDetectTypes: { type: "boolean", default: true },
        strictParsing: { type: "boolean", default: false },
      },
      compatibility: {
        minCoreVersion: "1.0.0",
        browsers: ["Chrome 90+", "Firefox 88+", "Safari 14+", "Edge 90+"],
      },
    };
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: "import",
        description: "Import CSV files with streaming support",
        type: "integration",
        version: "1.0.0",
        async: true,
        inputTypes: ["file"],
        outputTypes: ["dataset"],
      },
      {
        name: "preview",
        description: "Preview CSV file structure and schema",
        type: "utility",
        version: "1.0.0",
        async: true,
        inputTypes: ["file"],
        outputTypes: ["schema-preview"],
      },
    ];
  }

  isCompatible(coreVersion: string): boolean {
    return coreVersion >= "1.0.0";
  }

  // CSV Import Operations
  async previewFile(
    file: File,
    config: CSVImportConfig = {},
  ): Promise<SchemaPreview> {
    this.performanceTracker.markQueryStart("preview");

    try {
      const defaultConfig: CSVImportConfig = {
        previewRows: 1000,
        autoDetectTypes: true,
        encoding: "UTF-8",
        ...config,
      };

      // Read first chunk for analysis
      const chunk = await this.readFileChunk(
        file,
        0,
        Math.min(64 * 1024, file.size),
      ); // 64KB
      const text = await this.decodeText(chunk, defaultConfig.encoding!);

      // Detect delimiter if not specified
      let delimiter = defaultConfig.delimiter;
      if (!delimiter) {
        delimiter = await this.detectDelimiter(text);
      }

      // Parse preview data
      const parseResult = Papa.parse(text, {
        delimiter,
        quote: defaultConfig.quote || '"',
        escape: defaultConfig.escape || '"',
        header: false,
        skipEmptyLines: true,
        preview: defaultConfig.previewRows,
      });

      if (parseResult.errors.length > 0) {
        this.context?.logger.warn(
          "Parse errors in preview:",
          parseResult.errors,
        );
      }

      const rows = parseResult.data as string[][];
      if (rows.length === 0) {
        throw new Error("No data found in file");
      }

      // Determine if first row is header
      const hasHeader = defaultConfig.hasHeader ?? this.detectHeader(rows);
      const headers = hasHeader
        ? rows[0]
        : rows[0].map((_, i) => `column_${i}`);
      const dataRows = hasHeader ? rows.slice(1) : rows;

      // Infer column types
      const typeInference = defaultConfig.autoDetectTypes
        ? DataUtils.inferDataTypes(dataRows, headers)
        : headers.map(() => ({
            suggestedType: "string" as DataType,
            confidence: 1,
            samples: [],
            patterns: [],
          }));

      // Create column previews
      const columns: ColumnPreview[] = headers.map((name, index) => {
        const columnData = dataRows
          .map((row) => row[index])
          .filter((val) => val != null && val !== "");
        const inference = typeInference[index];

        return {
          index,
          name: name || `column_${index}`,
          inferredType: inference.suggestedType,
          confidence: inference.confidence,
          samples: columnData.slice(0, 10),
          nullCount: dataRows.length - columnData.length,
          uniqueCount: new Set(columnData).size,
        };
      });

      const preview: SchemaPreview = {
        columns,
        sampleData: dataRows.slice(0, 10),
        totalRows: this.estimateRowCount(file, text, delimiter),
        encoding: defaultConfig.encoding!,
        delimiter,
        hasHeader,
      };

      this.context?.eventBus.publish("csv:preview-complete", {
        plugin: this.getName(),
        fileName: file.name,
        fileSize: file.size,
        columnCount: columns.length,
        estimatedRows: preview.totalRows,
      });

      return preview;
    } catch (error) {
      this.context?.logger.error("Error previewing CSV file:", error);
      throw error;
    } finally {
      this.performanceTracker.markQueryEnd("preview");
    }
  }

  async importFile(
    file: File,
    config: CSVImportConfig = {},
    onProgress?: (progress: ImportProgress) => void,
  ): Promise<Dataset> {
    this.performanceTracker.markQueryStart("import");
    this.currentImport = new AbortController();

    try {
      const defaultConfig: CSVImportConfig = {
        chunkSize: 10000,
        autoDetectTypes: true,
        strictParsing: false,
        encoding: "UTF-8",
        ...config,
      };

      const progress: ImportProgress = {
        phase: "analyzing",
        percentage: 0,
        rowsProcessed: 0,
        errors: [],
        warnings: [],
      };

      onProgress?.(progress);

      // Step 1: Analyze file structure
      const preview = await this.previewFile(file, defaultConfig);
      progress.phase = "parsing";
      progress.percentage = 10;
      progress.totalRows = preview.totalRows;
      onProgress?.(progress);

      // Step 2: Parse file in chunks
      const dataset = await this.parseFileInChunks(
        file,
        defaultConfig,
        preview,
        (chunkProgress) => {
          progress.rowsProcessed = chunkProgress.rowsProcessed;
          progress.percentage = 10 + chunkProgress.percentage * 0.8; // 10% to 90%
          progress.errors.push(...chunkProgress.errors);
          progress.warnings.push(...chunkProgress.warnings);
          onProgress?.(progress);
        },
      );

      // Step 3: Validate data
      progress.phase = "validating";
      progress.percentage = 90;
      onProgress?.(progress);

      const validation = DataUtils.validateDataset(dataset);
      if (!validation.isValid) {
        progress.errors.push(
          ...validation.errors.map((msg) => ({
            row: -1,
            column: -1,
            field: "",
            value: null,
            message: msg,
            severity: "error" as const,
          })),
        );
      }
      progress.warnings.push(...validation.warnings);

      // Step 4: Complete
      progress.phase = "complete";
      progress.percentage = 100;
      onProgress?.(progress);

      this.context?.eventBus.publish("csv:import-complete", {
        plugin: this.getName(),
        fileName: file.name,
        fileSize: file.size,
        rowCount: dataset.rows.length,
        columnCount: dataset.columns.length,
        errors: progress.errors.length,
        warnings: progress.warnings.length,
      });

      return dataset;
    } catch (error) {
      this.context?.logger.error("Error importing CSV file:", error);
      throw error;
    } finally {
      this.currentImport = null;
      this.performanceTracker.markQueryEnd("import");
    }
  }

  async detectDelimiter(sample: string): Promise<string> {
    const delimiters = [",", ";", "\t", "|"];
    const scores: Record<string, number> = {};

    for (const delimiter of delimiters) {
      const result = Papa.parse(sample, {
        delimiter,
        preview: 10,
        skipEmptyLines: true,
      });

      if (result.data.length > 0) {
        const rows = result.data as string[][];
        const columnCounts = rows.map((row) => row.length);
        const avgColumns =
          columnCounts.reduce((sum, count) => sum + count, 0) /
          columnCounts.length;
        const variance =
          columnCounts.reduce(
            (sum, count) => sum + Math.pow(count - avgColumns, 2),
            0,
          ) / columnCounts.length;

        // Score based on consistency (lower variance is better) and column count
        scores[delimiter] = avgColumns > 1 ? avgColumns / (1 + variance) : 0;
      } else {
        scores[delimiter] = 0;
      }
    }

    // Return delimiter with highest score
    return Object.entries(scores).reduce(
      (best, [delimiter, score]) => (score > scores[best] ? delimiter : best),
      delimiters[0],
    );
  }

  async inferSchema(
    data: any[][],
    headers: string[],
  ): Promise<TypeInferenceResult[]> {
    return DataUtils.inferDataTypes(data, headers);
  }

  // Private Methods
  private async readFileChunk(
    file: File,
    start: number,
    size: number,
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file.slice(start, start + size));
    });
  }

  private async decodeText(
    buffer: ArrayBuffer,
    encoding: string,
  ): Promise<string> {
    const decoder = new TextDecoder(encoding);
    return decoder.decode(buffer);
  }

  private detectHeader(rows: string[][]): boolean {
    if (rows.length < 2) return true;

    const firstRow = rows[0];
    const secondRow = rows[1];

    // Check if first row has different data types than second row
    let differenceScore = 0;

    for (let i = 0; i < Math.min(firstRow.length, secondRow.length); i++) {
      const first = firstRow[i];
      const second = secondRow[i];

      // If first is string and second is number, likely header
      if (isNaN(Number(first)) && !isNaN(Number(second))) {
        differenceScore++;
      }

      // If first has no spaces/special chars and second does, likely header
      if (
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(first) &&
        !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(second)
      ) {
        differenceScore++;
      }
    }

    return differenceScore >= firstRow.length * 0.5;
  }

  private estimateRowCount(
    file: File,
    sample: string,
    delimiter: string,
  ): number {
    const lines = sample.split("\n").length;
    const sampleSize = sample.length;
    const ratio = lines / sampleSize;
    return Math.floor(file.size * ratio);
  }

  private async parseFileInChunks(
    file: File,
    config: CSVImportConfig,
    preview: SchemaPreview,
    onProgress: (progress: {
      percentage: number;
      rowsProcessed: number;
      errors: ImportError[];
      warnings: string[];
    }) => void,
  ): Promise<Dataset> {
    const columns = preview.columns.map((col) => ({
      name: col.name,
      type: col.inferredType,
    }));

    const allRows: any[][] = [];
    const errors: ImportError[] = [];
    const warnings: string[] = [];
    let totalBytesRead = 0;
    let rowsProcessed = 0;

    const chunkSize = 1024 * 1024; // 1MB chunks
    let position = 0;
    let remainingText = "";

    while (position < file.size) {
      // Check for abort signal
      if (this.currentImport?.signal.aborted) {
        throw new Error("Import cancelled");
      }

      const chunk = await this.readFileChunk(file, position, chunkSize);
      const text = await this.decodeText(chunk, config.encoding!);
      const fullText = remainingText + text;

      // Find last complete line
      const lastNewlineIndex = fullText.lastIndexOf("\n");
      const completeText = fullText.substring(0, lastNewlineIndex);
      remainingText = fullText.substring(lastNewlineIndex + 1);

      if (completeText) {
        // Parse chunk using worker
        const task: WorkerTask = {
          id: `chunk-${position}`,
          type: "parse-csv",
          data: {
            text: completeText,
            config: {
              delimiter: preview.delimiter,
              quote: config.quote || '"',
              escape: config.escape || '"',
              skipRows: position === 0 && preview.hasHeader ? 1 : 0,
            },
            columns: preview.columns,
          },
        };

        const result: WorkerResult = await this.workerManager.execute(task);

        if (result.success && result.data) {
          const { rows, parseErrors } = result.data;
          allRows.push(...rows);
          errors.push(...parseErrors);
          rowsProcessed += rows.length;
        } else {
          warnings.push(
            `Failed to parse chunk at position ${position}: ${result.error}`,
          );
        }
      }

      totalBytesRead += chunk.byteLength;
      position += chunkSize;

      // Report progress
      const percentage = (totalBytesRead / file.size) * 100;
      onProgress({ percentage, rowsProcessed, errors, warnings });
    }

    // Parse any remaining text
    if (remainingText.trim()) {
      const task: WorkerTask = {
        id: "chunk-final",
        type: "parse-csv",
        data: {
          text: remainingText,
          config: {
            delimiter: preview.delimiter,
            quote: config.quote || '"',
            escape: config.escape || '"',
            skipRows: 0,
          },
          columns: preview.columns,
        },
      };

      const result: WorkerResult = await this.workerManager.execute(task);

      if (result.success && result.data) {
        const { rows, parseErrors } = result.data;
        allRows.push(...rows);
        errors.push(...parseErrors);
        rowsProcessed += rows.length;
      }
    }

    return {
      columns,
      rows: allRows,
    };
  }
}
