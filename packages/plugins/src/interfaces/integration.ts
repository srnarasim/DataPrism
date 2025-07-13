import { IPlugin } from './plugin.js';
import { Dataset } from './data-processor.js';

export interface IIntegrationPlugin extends IPlugin {
  // Connection Management
  connect(endpoint: string, credentials?: Credentials): Promise<Connection>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  testConnection(): Promise<ConnectionTestResult>;
  
  // Authentication
  authenticate(credentials: Credentials): Promise<boolean>;
  refreshAuthentication(): Promise<boolean>;
  
  // Data Operations
  sync(data: Dataset): Promise<SyncResult>;
  import(source: DataSource): Promise<Dataset>;
  export(data: Dataset, target: DataTarget): Promise<ExportResult>;
  
  // Integration Capabilities
  getIntegrationCapabilities(): IntegrationCapability[];
  getSupportedProtocols(): Protocol[];
  getSupportedFormats(): DataFormat[];
}

export interface Connection {
  id: string;
  endpoint: string;
  status: ConnectionStatus;
  metadata: ConnectionMetadata;
  lastActivity: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

export interface ConnectionMetadata {
  protocol: string;
  version?: string;
  features: string[];
  limits: ConnectionLimits;
}

export interface ConnectionLimits {
  maxRequestSize: number;
  maxResponseSize: number;
  rateLimit: RateLimit;
  timeout: number;
}

export interface RateLimit {
  requests: number;
  windowMs: number;
  burst?: number;
}

export interface ConnectionTestResult {
  success: boolean;
  latency: number;
  error?: string;
  details: {
    endpoint: string;
    protocol: string;
    timestamp: string;
    version?: string;
  };
}

export interface Credentials {
  type: 'api-key' | 'oauth' | 'basic' | 'bearer' | 'custom';
  data: CredentialData;
  expires?: string;
  refreshable?: boolean;
}

export interface CredentialData {
  [key: string]: string | number | boolean;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errors: SyncError[];
  duration: number;
  timestamp: string;
}

export interface SyncError {
  record: any;
  error: string;
  code: string;
  recoverable: boolean;
}

export interface DataSource {
  type: 'file' | 'url' | 'database' | 'api' | 'stream';
  location: string;
  format: DataFormat;
  options: SourceOptions;
  credentials?: Credentials;
}

export interface DataTarget {
  type: 'file' | 'url' | 'database' | 'api' | 'storage';
  location: string;
  format: DataFormat;
  options: TargetOptions;
  credentials?: Credentials;
}

export interface SourceOptions {
  encoding?: string;
  delimiter?: string;
  headers?: boolean;
  skipRows?: number;
  maxRows?: number;
  compression?: 'gzip' | 'zip' | 'brotli';
  [key: string]: any;
}

export interface TargetOptions {
  overwrite?: boolean;
  append?: boolean;
  compression?: 'gzip' | 'zip' | 'brotli';
  batchSize?: number;
  [key: string]: any;
}

export interface ExportResult {
  success: boolean;
  location: string;
  size: number;
  recordCount: number;
  checksum?: string;
  duration: number;
  timestamp: string;
}

export interface IntegrationCapability {
  name: string;
  description: string;
  type: 'import' | 'export' | 'sync' | 'stream';
  protocols: Protocol[];
  formats: DataFormat[];
  bidirectional: boolean;
  realtime: boolean;
}

export interface Protocol {
  name: string;
  version: string;
  description: string;
  secure: boolean;
  authentication: string[];
}

export type DataFormat = 
  | 'json' 
  | 'csv' 
  | 'xml' 
  | 'parquet' 
  | 'avro'
  | 'orc'
  | 'excel'
  | 'yaml'
  | 'toml'
  | 'binary'
  | 'custom';

// Specialized Integration Plugin Types

export interface ILLMIntegrationPlugin extends IIntegrationPlugin {
  // LLM-specific operations
  generateCompletion(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
  generateEmbedding(text: string): Promise<number[]>;
  analyzeData(data: Dataset, query: string): Promise<AnalysisResult>;
  
  // Model Management
  listModels(): Promise<ModelInfo[]>;
  getModelInfo(modelId: string): Promise<ModelInfo>;
  setDefaultModel(modelId: string): Promise<void>;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  streaming?: boolean;
}

export interface CompletionResult {
  text: string;
  finishReason: string;
  usage: TokenUsage;
  model: string;
  timestamp: string;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface AnalysisResult {
  insights: string[];
  summary: string;
  recommendations: string[];
  confidence: number;
  sources: string[];
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  type: 'completion' | 'embedding' | 'classification';
  maxTokens: number;
  costPer1kTokens: number;
}