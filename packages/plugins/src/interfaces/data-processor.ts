import { IPlugin } from "./plugin.js";

export interface IDataProcessorPlugin extends IPlugin {
  // Data Processing Operations
  process(data: Dataset, options?: ProcessingOptions): Promise<Dataset>;
  transform(data: Dataset, rules: TransformationRule[]): Promise<Dataset>;
  validate(data: Dataset): Promise<ValidationResult>;

  // Processing Capabilities
  getProcessingCapabilities(): ProcessingCapability[];
  getSupportedDataTypes(): DataType[];
  getPerformanceMetrics(): ProcessingMetrics;

  // Advanced Features
  batch(datasets: Dataset[]): Promise<Dataset[]>;
  stream(dataStream: ReadableStream<Dataset>): Promise<ReadableStream<Dataset>>;
}

export interface Dataset {
  id: string;
  name: string;
  schema: DataSchema;
  data: any[];
  metadata: DataMetadata;
}

export interface DataSchema {
  fields: DataField[];
  primaryKey?: string[];
  indexes?: DataIndex[];
}

export interface DataField {
  name: string;
  type: DataType;
  nullable: boolean;
  description?: string;
  constraints?: FieldConstraint[];
}

export interface DataIndex {
  name: string;
  fields: string[];
  unique: boolean;
  type: "btree" | "hash" | "fulltext";
}

export interface FieldConstraint {
  type: "min" | "max" | "pattern" | "enum" | "unique";
  value: any;
}

export interface DataMetadata {
  createdAt: string;
  updatedAt: string;
  source?: string;
  tags?: string[];
  size: number;
  checksum?: string;
  [key: string]: any;
}

export type DataType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "datetime"
  | "json"
  | "array"
  | "object"
  | "binary";

export interface ProcessingOptions {
  mode: "sync" | "async" | "streaming";
  batchSize?: number;
  timeout?: number;
  validation?: boolean;
  caching?: boolean;
  parallel?: boolean;
  priority?: "low" | "normal" | "high";
}

export interface TransformationRule {
  field: string;
  operation: string;
  parameters: Record<string, any>;
  condition?: string;
  target?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  statistics: ValidationStatistics;
  summary: ValidationSummary;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
  row?: number;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
  row?: number;
}

export interface ValidationStatistics {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errorCount: number;
  warningCount: number;
  completeness: number; // percentage
  uniqueness: number; // percentage
}

export interface ValidationSummary {
  overallScore: number; // 0-100
  dataQuality: "excellent" | "good" | "fair" | "poor";
  recommendations: string[];
}

export interface ProcessingCapability {
  name: string;
  description: string;
  inputTypes: DataType[];
  outputTypes: DataType[];
  complexity: "low" | "medium" | "high";
  async: boolean;
  streaming: boolean;
  batchSupport: boolean;
}

export interface ProcessingMetrics {
  averageProcessingTime: number;
  throughput: number; // rows per second
  memoryUsage: number;
  cpuUsage: number;
  successRate: number;
  lastUpdated: string;
}
