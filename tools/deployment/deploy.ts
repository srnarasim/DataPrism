#!/usr/bin/env node

/**
 * CDN Deployment Orchestrator
 * Main entry point for CDN deployment operations
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { createHash } from 'crypto';
import { GitHubPagesProvider } from './providers/github-pages.js';
import { CDNDeploymentValidator } from './validator.js';
import {
  AssetBundle,
  AssetFile,
  DeploymentConfig,
  DeploymentResult,
  ValidationResult,
  DEFAULT_DEPLOYMENT_CONFIG,
} from './types.js';

interface DeploymentOptions {
  target?: 'github-pages' | 'cloudflare-pages' | 'netlify' | 'vercel';
  environment?: 'development' | 'staging' | 'production';
  dryRun?: boolean;
  validate?: boolean;
  force?: boolean;
  configFile?: string;
  assetsDir?: string;
  baseUrl?: string;
  repository?: string;
  branch?: string;
  customDomain?: string;
}

class CDNDeploymentOrchestrator {
  private validator: CDNDeploymentValidator;

  constructor() {
    this.validator = new CDNDeploymentValidator({
      timeout: 30000,
      retries: 3,
      strictMode: false,
    });
  }

  async deploy(options: DeploymentOptions): Promise<DeploymentResult> {
    console.log('🚀 Starting CDN deployment...');
    console.log(`📋 Options:`, JSON.stringify(options, null, 2));

    try {
      // Load configuration
      const config = await this.loadConfiguration(options);
      console.log(`🔧 Deployment config:`, JSON.stringify(config, null, 2));

      // Prepare asset bundle
      const assets = await this.prepareAssetBundle(options.assetsDir || 'cdn/dist');
      console.log(`📦 Prepared ${assets.files.length} assets (${this.formatSize(assets.totalSize)})`);

      // Dry run check
      if (options.dryRun) {
        console.log('🔍 Dry run mode - would deploy:');
        this.printAssetSummary(assets);
        return {
          success: true,
          deploymentId: 'dry-run',
          url: config.baseUrl || 'https://example.com',
          logs: ['Dry run completed successfully'],
        };
      }

      // Get deployment provider
      const provider = this.getDeploymentProvider(config);

      // Test connection
      console.log('🔗 Testing connection...');
      const connected = await provider.testConnection();
      if (!connected) {
        throw new Error('Failed to connect to deployment provider');
      }

      // Deploy assets
      console.log('📤 Deploying assets...');
      const result = await provider.deploy(assets, config);

      if (!result.success) {
        throw new Error(result.error || 'Deployment failed');
      }

      console.log(`✅ Deployment successful!`);
      console.log(`🌐 URL: ${result.url}`);
      console.log(`🏷️  Deployment ID: ${result.deploymentId}`);

      // Validate deployment
      if (options.validate !== false) {
        console.log('🔍 Validating deployment...');
        await this.validateDeployment(result.url);
      }

      return result;

    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }

  async validate(url: string, options: { strict?: boolean } = {}): Promise<ValidationResult> {
    console.log(`🔍 Validating CDN deployment: ${url}`);

    this.validator = new CDNDeploymentValidator({
      strictMode: options.strict || false,
      timeout: 30000,
    });

    return await this.validator.validateDeployment(url);
  }

  async rollback(deploymentId: string, options: DeploymentOptions): Promise<DeploymentResult> {
    console.log(`🔄 Rolling back deployment: ${deploymentId}`);

    const config = await this.loadConfiguration(options);
    const provider = this.getDeploymentProvider(config);

    return await provider.rollback(deploymentId, {
      deploymentId,
      target: config.target,
    });
  }

  async listDeployments(options: DeploymentOptions, limit: number = 10): Promise<void> {
    const config = await this.loadConfiguration(options);
    const provider = this.getDeploymentProvider(config);

    const deployments = await provider.listDeployments(limit);

    console.log(`📋 Recent deployments (${deployments.length}):`);
    deployments.forEach((deployment, index) => {
      console.log(`  ${index + 1}. ${deployment.id} - ${deployment.status} - ${deployment.createdAt}`);
      console.log(`     URL: ${deployment.url}`);
      console.log(`     Branch: ${deployment.branch} (${deployment.commitHash.substring(0, 8)})`);
    });
  }

  private async loadConfiguration(options: DeploymentOptions): Promise<DeploymentConfig> {
    let config: DeploymentConfig = {
      ...DEFAULT_DEPLOYMENT_CONFIG,
      target: options.target || 'github-pages',
      environment: options.environment || 'production',
    };

    // Load from config file if specified
    if (options.configFile && existsSync(options.configFile)) {
      const fileConfig = JSON.parse(readFileSync(options.configFile, 'utf8'));
      config = { ...config, ...fileConfig };
    }

    // Override with CLI options
    if (options.repository) config.repository = options.repository;
    if (options.branch) config.branch = options.branch;
    if (options.customDomain) config.customDomain = options.customDomain;
    if (options.baseUrl) config.baseUrl = options.baseUrl;

    // Validate required fields
    if (config.target === 'github-pages' && !config.repository) {
      throw new Error('GitHub repository is required for GitHub Pages deployment');
    }

    return config;
  }

  private async prepareAssetBundle(assetsDir: string): Promise<AssetBundle> {
    if (!existsSync(assetsDir)) {
      throw new Error(`Assets directory not found: ${assetsDir}`);
    }

    const files: AssetFile[] = [];
    let totalSize = 0;

    // Recursively scan assets directory
    const scanDirectory = (dir: string, relativePath: string = '') => {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stats = statSync(fullPath);
        const relativeFilePath = join(relativePath, entry);

        if (stats.isDirectory()) {
          scanDirectory(fullPath, relativeFilePath);
        } else if (stats.isFile()) {
          const content = readFileSync(fullPath);
          const hash = createHash('sha384').update(content).digest('hex');
          
          files.push({
            path: relativeFilePath.replace(/\\/g, '/'), // Normalize path separators
            content,
            mimeType: this.getMimeType(entry),
            size: stats.size,
            hash,
          });

          totalSize += stats.size;
        }
      }
    };

    scanDirectory(assetsDir);

    // Load manifest if it exists
    let manifest: any = {};
    const manifestPath = join(assetsDir, 'manifest.json');
    if (existsSync(manifestPath)) {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    }

    return {
      files,
      manifest,
      totalSize,
      metadata: {
        deploymentId: this.generateDeploymentId(),
        timestamp: new Date().toISOString(),
        target: 'unknown', // Will be set by provider
        environment: 'production',
      },
    };
  }

  private getDeploymentProvider(config: DeploymentConfig) {
    switch (config.target) {
      case 'github-pages':
        return new GitHubPagesProvider({
          repository: config.repository!,
          branch: config.branch,
          customDomain: config.customDomain,
          token: process.env.GITHUB_TOKEN,
          username: process.env.GIT_USERNAME || 'github-actions[bot]',
          email: process.env.GIT_EMAIL || 'github-actions[bot]@users.noreply.github.com',
        });

      case 'cloudflare-pages':
      case 'netlify':
      case 'vercel':
        throw new Error(`Deployment target '${config.target}' is not yet implemented`);

      default:
        throw new Error(`Unknown deployment target: ${config.target}`);
    }
  }

  private async validateDeployment(url: string): Promise<void> {
    try {
      const result = await this.validator.validateDeployment(url);
      
      if (result.success) {
        console.log('✅ Deployment validation passed');
      } else {
        console.warn('⚠️  Deployment validation has issues');
        
        const failed = result.checks.filter(c => c.status === 'failed');
        if (failed.length > 0) {
          console.log('❌ Failed checks:');
          failed.forEach(check => {
            console.log(`  - ${check.name}: ${check.message}`);
          });
        }
      }

      if (result.performance) {
        console.log(`⚡ Performance: ${result.performance.loadTime}ms load time`);
      }

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }

  private printAssetSummary(assets: AssetBundle): void {
    console.log(`\n📊 Asset Summary:`);
    console.log(`  Total files: ${assets.files.length}`);
    console.log(`  Total size: ${this.formatSize(assets.totalSize)}`);
    
    const assetTypes = this.groupAssetsByType(assets.files);
    Object.entries(assetTypes).forEach(([type, files]) => {
      const typeSize = files.reduce((sum, file) => sum + file.size, 0);
      console.log(`  ${type}: ${files.length} files (${this.formatSize(typeSize)})`);
    });
  }

  private groupAssetsByType(files: AssetFile[]): Record<string, AssetFile[]> {
    const groups: Record<string, AssetFile[]> = {};
    
    files.forEach(file => {
      const ext = file.path.split('.').pop()?.toLowerCase() || 'unknown';
      const type = ext === 'js' ? 'JavaScript' : 
                  ext === 'wasm' ? 'WebAssembly' :
                  ext === 'json' ? 'JSON' :
                  ext === 'map' ? 'Source Maps' :
                  ext;
      
      if (!groups[type]) groups[type] = [];
      groups[type].push(file);
    });

    return groups;
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'js': 'application/javascript',
      'wasm': 'application/wasm',
      'json': 'application/json',
      'map': 'application/json',
      'css': 'text/css',
      'html': 'text/html',
      'txt': 'text/plain',
      'md': 'text/markdown',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateDeploymentId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `deploy_${timestamp}_${random}`;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
DataPrism CDN Deployment Tool

Usage:
  deploy [options]     Deploy assets to CDN
  validate <url>       Validate existing deployment
  rollback <id>        Rollback to previous deployment
  list                 List recent deployments

Options:
  --target <provider>     Deployment target (github-pages, cloudflare-pages, netlify, vercel)
  --environment <env>     Environment (development, staging, production)
  --repository <repo>     GitHub repository (owner/repo)
  --branch <branch>       Git branch for deployment
  --custom-domain <url>   Custom domain name
  --assets-dir <path>     Assets directory (default: cdn/dist)
  --config <file>         Configuration file
  --dry-run              Preview deployment without executing
  --no-validate          Skip deployment validation
  --force                Force deployment even if no changes
  --strict               Strict validation mode

Examples:
  deploy --target github-pages --repository myorg/myrepo
  validate https://myorg.github.io/myrepo
  rollback deploy_1234567890_abc123
    `);
    process.exit(0);
  }

  const orchestrator = new CDNDeploymentOrchestrator();

  try {
    const options = parseArgs(args.slice(1));

    switch (command) {
      case 'deploy':
        await orchestrator.deploy(options);
        break;

      case 'validate':
        const url = args[1];
        if (!url) {
          console.error('❌ URL is required for validation');
          process.exit(1);
        }
        await orchestrator.validate(url, { strict: options.strict });
        break;

      case 'rollback':
        const deploymentId = args[1];
        if (!deploymentId) {
          console.error('❌ Deployment ID is required for rollback');
          process.exit(1);
        }
        await orchestrator.rollback(deploymentId, options);
        break;

      case 'list':
        await orchestrator.listDeployments(options);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function parseArgs(args: string[]): DeploymentOptions {
  const options: DeploymentOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--target':
        options.target = nextArg as any;
        i++;
        break;
      case '--environment':
        options.environment = nextArg as any;
        i++;
        break;
      case '--repository':
        options.repository = nextArg;
        i++;
        break;
      case '--branch':
        options.branch = nextArg;
        i++;
        break;
      case '--custom-domain':
        options.customDomain = nextArg;
        i++;
        break;
      case '--assets-dir':
        options.assetsDir = nextArg;
        i++;
        break;
      case '--config':
        options.configFile = nextArg;
        i++;
        break;
      case '--base-url':
        options.baseUrl = nextArg;
        i++;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-validate':
        options.validate = false;
        break;
      case '--force':
        options.force = true;
        break;
    }
  }

  return options;
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { CDNDeploymentOrchestrator, type DeploymentOptions };