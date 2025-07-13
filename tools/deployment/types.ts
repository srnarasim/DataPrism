/**
 * CDN Deployment Types
 * Defines interfaces for multi-CDN deployment providers
 */

export interface AssetBundle {
  files: AssetFile[];
  manifest: AssetManifest;
  totalSize: number;
  metadata: DeploymentMetadata;
}

export interface AssetFile {
  path: string;
  content: Buffer | string;
  mimeType: string;
  size: number;
  hash: string;
  compression?: 'gzip' | 'brotli' | 'none';
}

export interface AssetManifest {
  version: string;
  timestamp: string;
  assets: Record<string, AssetInfo>;
  integrity: Record<string, string>;
  metadata: BuildMetadata;
}

export interface AssetInfo {
  filename: string;
  size: number;
  hash: string;
  mimeType: string;
  cacheDuration: number;
}

export interface BuildMetadata {
  buildDate: string;
  buildId: string;
  gitCommit?: string;
  gitBranch?: string;
  target: string;
  totalBundleSize: number;
}

export interface DeploymentMetadata {
  deploymentId: string;
  timestamp: string;
  target: string;
  environment: 'development' | 'staging' | 'production';
  branch?: string;
  commitHash?: string;
}

export interface DeploymentConfig {
  target: 'github-pages' | 'cloudflare-pages' | 'netlify' | 'vercel';
  repository?: string;
  branch?: string;
  customDomain?: string;
  environment: 'development' | 'staging' | 'production';
  baseUrl?: string;
  buildCommand?: string;
  outputDir?: string;
  headers?: Record<string, string>;
  redirects?: Redirect[];
  secrets?: Record<string, string>;
}

export interface Redirect {
  from: string;
  to: string;
  status: number;
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  url: string;
  previewUrl?: string;
  logs: string[];
  metrics?: DeploymentMetrics;
  error?: string;
}

export interface DeploymentMetrics {
  buildTime: number;
  deployTime: number;
  totalFiles: number;
  totalSize: number;
  compressionRatio: number;
}

export interface ValidationResult {
  success: boolean;
  checks: ValidationCheck[];
  performance?: PerformanceMetrics;
  security?: SecurityCheck[];
}

export interface ValidationCheck {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
}

export interface PerformanceMetrics {
  loadTime: number;
  wasmLoadTime: number;
  pluginLoadTimes: Record<string, number>;
  totalSize: number;
  compressionRatio: number;
}

export interface SecurityCheck {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  description: string;
  recommendation?: string;
}

export interface RollbackOptions {
  deploymentId: string;
  target: string;
  preserveAssets?: boolean;
  notifyUsers?: boolean;
}

export abstract class CDNDeploymentProvider {
  abstract name: string;
  abstract supportedTargets: string[];

  /**
   * Deploy assets to the CDN provider
   */
  abstract deploy(
    assets: AssetBundle,
    config: DeploymentConfig
  ): Promise<DeploymentResult>;

  /**
   * Validate deployment and check asset accessibility
   */
  abstract validate(
    url: string,
    config: DeploymentConfig
  ): Promise<ValidationResult>;

  /**
   * Rollback to a previous deployment
   */
  abstract rollback(
    deploymentId: string,
    options: RollbackOptions
  ): Promise<DeploymentResult>;

  /**
   * Get deployment status and logs
   */
  abstract getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;

  /**
   * List recent deployments
   */
  abstract listDeployments(limit?: number): Promise<DeploymentInfo[]>;

  /**
   * Clean up old deployments and assets
   */
  abstract cleanup(retentionDays: number): Promise<void>;

  /**
   * Test connectivity and authentication
   */
  abstract testConnection(): Promise<boolean>;
}

export interface DeploymentStatus {
  id: string;
  status: 'pending' | 'building' | 'ready' | 'error' | 'cancelled';
  progress: number;
  logs: string[];
  url?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface DeploymentInfo {
  id: string;
  status: DeploymentStatus['status'];
  url: string;
  branch: string;
  commitHash: string;
  createdAt: string;
  metrics?: DeploymentMetrics;
}

export interface DeploymentHooks {
  beforeDeploy?: (assets: AssetBundle, config: DeploymentConfig) => Promise<void>;
  afterDeploy?: (result: DeploymentResult, config: DeploymentConfig) => Promise<void>;
  onError?: (error: Error, config: DeploymentConfig) => Promise<void>;
  onSuccess?: (result: DeploymentResult, config: DeploymentConfig) => Promise<void>;
}

export interface CDNProviderOptions {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  organizationId?: string;
  projectId?: string;
  timeout?: number;
  retries?: number;
  hooks?: DeploymentHooks;
}

export const DEFAULT_DEPLOYMENT_CONFIG: Partial<DeploymentConfig> = {
  environment: 'production',
  branch: 'main',
  outputDir: 'cdn/dist',
  headers: {
    'Cache-Control': 'public, max-age=31536000',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  },
};

export const VALIDATION_CHECKS = {
  ASSET_INTEGRITY: 'asset-integrity',
  WASM_LOADING: 'wasm-loading',
  PLUGIN_LOADING: 'plugin-loading',
  CORS_HEADERS: 'cors-headers',
  CACHE_HEADERS: 'cache-headers',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
} as const;