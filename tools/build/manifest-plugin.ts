import { Plugin } from "vite";
import { createHash } from "crypto";
import { writeFileSync, readFileSync, statSync } from "fs";
import { join, extname, basename } from "path";
import { execSync } from "child_process";
import { 
  CDNBuildConfig, 
  AssetManifest, 
  AssetInfo, 
  PluginAssetInfo, 
  WasmAssetInfo,
  BuildMetadata,
  BrowserCompatibility,
  SIZE_LIMITS
} from "./types.js";

export interface ManifestPluginOptions {
  config: CDNBuildConfig;
}

export function manifestPlugin(options: ManifestPluginOptions): Plugin {
  const { config } = options;
  const assetMap = new Map<string, AssetInfo>();
  const pluginAssets: PluginAssetInfo[] = [];
  const wasmAssets: WasmAssetInfo[] = [];

  return {
    name: "cdn-manifest-generator",

    generateBundle(opts, bundle) {
      // Process all bundle assets
      Object.entries(bundle).forEach(([filename, asset]) => {
        if (asset.type === 'asset') {
          const assetInfo = createAssetInfo(filename, asset.source, config);
          assetMap.set(filename, assetInfo);

          // Categorize assets
          if (filename.endsWith('.wasm')) {
            wasmAssets.push(createWasmAssetInfo(filename, asset.source, config));
          } else if (filename.includes('plugin')) {
            // This would be enhanced to detect actual plugins
            const pluginInfo = createPluginAssetInfo(filename, asset.source, config);
            if (pluginInfo) {
              pluginAssets.push(pluginInfo);
            }
          }
        } else if (asset.type === 'chunk') {
          const assetInfo = createAssetInfo(filename, asset.code, config);
          assetMap.set(filename, assetInfo);
        }
      });

      // Generate comprehensive manifest
      const manifest = generateManifest(assetMap, pluginAssets, wasmAssets, config);
      
      // Emit manifest file
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2),
      });

      // Generate provider-specific configurations
      generateProviderConfigs(manifest, config, this);

      // Validate bundle sizes
      validateBundleSizes(assetMap, config);
    },
  };
}

function createAssetInfo(filename: string, source: string | Uint8Array, config: CDNBuildConfig): AssetInfo {
  const content = typeof source === 'string' ? Buffer.from(source) : Buffer.from(source);
  const hash = createHash('sha384').update(content).digest('hex');
  const size = content.length;
  
  // Simulate compression for size estimation
  const compressedSize = Math.floor(size * 0.7); // Rough gzip estimation

  return {
    filename,
    size,
    compressedSize,
    hash,
    mimeType: getMimeType(filename),
    cacheDuration: getCacheDuration(filename, config),
    lastModified: new Date().toISOString(),
  };
}

function createWasmAssetInfo(filename: string, source: string | Uint8Array, config: CDNBuildConfig): WasmAssetInfo {
  const baseInfo = createAssetInfo(filename, source, config);
  
  return {
    ...baseInfo,
    streamingCompilation: config.optimization.wasmOptimization,
    memoryRequirement: estimateWasmMemory(source),
    crossOriginIsolation: true,
  };
}

function createPluginAssetInfo(filename: string, source: string | Uint8Array, config: CDNBuildConfig): PluginAssetInfo | null {
  const baseInfo = createAssetInfo(filename, source, config);
  
  // Extract plugin metadata (this would be enhanced with actual plugin parsing)
  const pluginName = basename(filename, extname(filename));
  const pluginId = pluginName.replace(/[-_]/g, '.');
  
  return {
    ...baseInfo,
    id: pluginId,
    name: pluginName,
    version: '1.0.0', // Would be extracted from plugin metadata
    category: 'utility',
    dependencies: [],
    entry: filename,
    exports: ['default'],
  };
}

function generateManifest(
  assets: Map<string, AssetInfo>,
  plugins: PluginAssetInfo[],
  wasm: WasmAssetInfo[],
  config: CDNBuildConfig
): AssetManifest {
  const buildHash = createHash('sha256')
    .update(Array.from(assets.values()).map(a => a.hash).join(''))
    .digest('hex')
    .substring(0, 8);

  const totalBundleSize = Array.from(assets.values()).reduce((sum, asset) => sum + asset.size, 0);
  const totalCompressedSize = Array.from(assets.values()).reduce((sum, asset) => sum + asset.compressedSize, 0);

  // Find core assets
  const assetsList = Array.from(assets.values());
  const coreAsset = assetsList.find(a => a.filename.includes('core')) || assetsList[0];
  const orchestrationAsset = assetsList.find(a => a.filename.includes('orchestration')) || coreAsset;
  const pluginFrameworkAsset = assetsList.find(a => a.filename.includes('plugin-framework')) || coreAsset;

  return {
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    buildHash,
    assets: {
      core: coreAsset,
      orchestration: orchestrationAsset,
      pluginFramework: pluginFrameworkAsset,
      plugins,
      wasm,
    },
    integrity: generateIntegrityMap(assets, wasm, plugins),
    metadata: {
      buildDate: new Date().toISOString(),
      buildId: buildHash,
      nodeVersion: process.version,
      gitCommit: getGitCommit(),
      gitBranch: getGitBranch(),
      target: config.target,
      optimization: config.optimization,
      totalBundleSize,
      compressionRatio: totalCompressedSize / totalBundleSize,
    },
    compatibility: {
      chrome: '90+',
      firefox: '88+',
      safari: '14+',
      edge: '90+',
      webAssembly: true,
      es2020: true,
    },
  };
}

function generateIntegrityMap(
  assets: Map<string, AssetInfo>,
  wasm: WasmAssetInfo[],
  plugins: PluginAssetInfo[]
): Record<string, string> {
  const integrity: Record<string, string> = {};
  
  assets.forEach((asset, filename) => {
    integrity[filename] = `sha384-${Buffer.from(asset.hash, 'hex').toString('base64')}`;
  });

  return integrity;
}

function generateProviderConfigs(manifest: AssetManifest, config: CDNBuildConfig, context: any) {
  // GitHub Pages specific configuration
  if (config.target === 'github-pages') {
    const jekyllConfig = {
      plugins: ['jekyll-gist'],
      include: ['_*', '.nojekyll'],
      exclude: ['node_modules/', 'Gemfile*'],
    };

    context.emitFile({
      type: 'asset',
      fileName: '_config.yml',
      source: `# GitHub Pages Jekyll Configuration\n${Object.entries(jekyllConfig)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')}`,
    });

    context.emitFile({
      type: 'asset',
      fileName: '.nojekyll',
      source: '',
    });
  }

  // Generate CORS headers file for various providers
  const corsHeaders = generateCORSHeaders(config);
  context.emitFile({
    type: 'asset',
    fileName: '_headers',
    source: corsHeaders,
  });
}

function generateCORSHeaders(config: CDNBuildConfig): string {
  const baseUrl = config.assets.baseUrl || '/*';
  
  return `${baseUrl}
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  
*.wasm
  Content-Type: application/wasm
  Cache-Control: public, max-age=31536000, immutable
  
*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable
  
manifest.json
  Content-Type: application/json
  Cache-Control: public, max-age=3600`;
}

function validateBundleSizes(assets: Map<string, AssetInfo>, config: CDNBuildConfig): void {
  const issues: string[] = [];
  
  assets.forEach((asset, filename) => {
    // Check individual file limits
    Object.entries(SIZE_LIMITS).forEach(([pattern, limit]) => {
      if (filename.includes(pattern) && asset.size > limit) {
        issues.push(`${filename} exceeds size limit: ${asset.size} > ${limit} bytes`);
      }
    });
  });

  const totalSize = Array.from(assets.values()).reduce((sum, asset) => sum + asset.size, 0);
  if (totalSize > SIZE_LIMITS.total) {
    issues.push(`Total bundle size exceeds limit: ${totalSize} > ${SIZE_LIMITS.total} bytes`);
  }

  if (issues.length > 0) {
    console.warn('Bundle size validation issues:', issues);
    // Don't fail the build, just warn
  }
}

function getMimeType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.js': 'application/javascript',
    '.wasm': 'application/wasm',
    '.json': 'application/json',
    '.map': 'application/json',
    '.css': 'text/css',
    '.html': 'text/html',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function getCacheDuration(filename: string, config: CDNBuildConfig): number {
  if (filename.includes('manifest')) {
    return config.assets.caching.manifests;
  } else if (filename.endsWith('.wasm')) {
    return config.assets.caching.wasm;
  } else if (filename.includes('plugin')) {
    return config.assets.caching.plugins;
  }
  return config.assets.caching.staticAssets;
}

function estimateWasmMemory(source: string | Uint8Array): number {
  // Rough estimation - would be enhanced with actual WASM parsing
  const size = typeof source === 'string' ? Buffer.from(source).length : source.length;
  return Math.max(size * 2, 1024 * 1024); // At least 1MB, typically 2x file size
}

function getGitCommit(): string | undefined {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return undefined;
  }
}

function getGitBranch(): string | undefined {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return undefined;
  }
}