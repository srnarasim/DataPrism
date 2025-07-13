/**
 * CDN Build Configuration Types
 * Defines interfaces for multi-CDN deployment configuration
 */

export interface CDNBuildConfig {
  target: 'github-pages' | 'cloudflare-pages' | 'netlify' | 'vercel';
  optimization: OptimizationConfig;
  assets: AssetConfig;
  deployment?: DeploymentConfig;
}

export interface OptimizationConfig {
  compression: 'gzip' | 'brotli' | 'both';
  treeshaking: boolean;
  codesplitting: boolean;
  wasmOptimization: boolean;
  minification: boolean;
}

export interface AssetConfig {
  integrity: boolean;
  versioning: 'hash' | 'timestamp' | 'semver';
  caching: CacheConfig;
  baseUrl?: string;
}

export interface CacheConfig {
  staticAssets: number; // Cache duration in seconds
  manifests: number;
  wasm: number;
  plugins: number;
}

export interface DeploymentConfig {
  repository?: string;
  branch?: string;
  customDomain?: string;
  environment: 'development' | 'staging' | 'production';
}

export interface AssetManifest {
  version: string;
  timestamp: string;
  buildHash: string;
  assets: {
    core: AssetInfo;
    orchestration: AssetInfo;
    pluginFramework: AssetInfo;
    plugins: PluginAssetInfo[];
    wasm: WasmAssetInfo[];
  };
  integrity: Record<string, string>;
  metadata: BuildMetadata;
  compatibility: BrowserCompatibility;
}

export interface AssetInfo {
  filename: string;
  size: number;
  compressedSize: number;
  hash: string;
  mimeType: string;
  cacheDuration: number;
  lastModified: string;
}

export interface PluginAssetInfo extends AssetInfo {
  id: string;
  name: string;
  version: string;
  category: string;
  dependencies: string[];
  entry: string;
  exports: string[];
}

export interface WasmAssetInfo extends AssetInfo {
  streamingCompilation: boolean;
  memoryRequirement: number;
  crossOriginIsolation: boolean;
}

export interface BuildMetadata {
  buildDate: string;
  buildId: string;
  nodeVersion: string;
  gitCommit?: string;
  gitBranch?: string;
  target: string;
  optimization: OptimizationConfig;
  totalBundleSize: number;
  compressionRatio: number;
}

export interface BrowserCompatibility {
  chrome: string;
  firefox: string;
  safari: string;
  edge: string;
  webAssembly: boolean;
  es2020: boolean;
}

export interface AssetIntegrity {
  algorithm: 'sha256' | 'sha384' | 'sha512';
  hash: string;
  crossorigin: 'anonymous' | 'use-credentials';
}

export interface CDNProviderConfig {
  name: string;
  baseUrl: string;
  headers: Record<string, string>;
  corsPolicy: CORSConfig;
  caching: CacheConfig;
  compression: string[];
}

export interface CORSConfig {
  allowOrigin: string | string[];
  allowMethods: string[];
  allowHeaders: string[];
  embedderPolicy: string;
  openerPolicy: string;
}

export const CDN_CSP_POLICIES = {
  'script-src': "'self' 'wasm-unsafe-eval'",
  'worker-src': "'self' blob:",
  'connect-src': "'self'",
  'object-src': "'none'",
  'base-uri': "'self'"
} as const;

export const DEFAULT_CDN_CONFIG: CDNBuildConfig = {
  target: 'github-pages',
  optimization: {
    compression: 'both',
    treeshaking: true,
    codesplitting: true,
    wasmOptimization: true,
    minification: true,
  },
  assets: {
    integrity: true,
    versioning: 'hash',
    caching: {
      staticAssets: 31536000, // 1 year
      manifests: 3600, // 1 hour
      wasm: 31536000, // 1 year
      plugins: 86400, // 1 day
    },
  },
};

export const SIZE_LIMITS = {
  'core.min.js': 2 * 1024 * 1024, // 2MB
  'orchestration.min.js': 800 * 1024, // 800KB
  'plugin-framework.min.js': 500 * 1024, // 500KB
  'wasm': 1.5 * 1024 * 1024, // 1.5MB
  'plugin': 500 * 1024, // 500KB per plugin
  'total': 5 * 1024 * 1024, // 5MB total
} as const;