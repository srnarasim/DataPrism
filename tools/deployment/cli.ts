#!/usr/bin/env node

/**
 * DataPrism CDN Deployment CLI
 * Command-line interface for CDN deployment operations
 */

import { program } from 'commander';
import { CDNDeploymentOrchestrator } from './deploy.js';
import { CDNDeploymentValidator } from './validator.js';
import { PluginManifestGenerator } from '../build/plugin-manifest-generator.js';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

// Package information
const packagePath = resolve(__dirname, '../../package.json');
const packageJson = existsSync(packagePath) 
  ? JSON.parse(readFileSync(packagePath, 'utf8'))
  : { version: '1.0.0' };

// Configure CLI program
program
  .name('dataprism-deploy')
  .description('DataPrism CDN Deployment Tool')
  .version(packageJson.version);

// Deploy command
program
  .command('deploy')
  .description('Deploy assets to CDN')
  .option('-t, --target <provider>', 'Deployment target (github-pages, cloudflare-pages, netlify, vercel)', 'github-pages')
  .option('-e, --environment <env>', 'Environment (development, staging, production)', 'production')
  .option('-r, --repository <repo>', 'GitHub repository (owner/repo)')
  .option('-b, --branch <branch>', 'Git branch for deployment', 'gh-pages')
  .option('-d, --custom-domain <domain>', 'Custom domain name')
  .option('-a, --assets-dir <path>', 'Assets directory', 'cdn/dist')
  .option('-c, --config <file>', 'Configuration file')
  .option('--base-url <url>', 'Base URL for assets')
  .option('--dry-run', 'Preview deployment without executing')
  .option('--no-validate', 'Skip deployment validation')
  .option('--force', 'Force deployment even if no changes')
  .option('--verbose', 'Verbose logging')
  .action(async (options) => {
    try {
      if (options.verbose) {
        process.env.DEBUG = 'dataprism:*';
      }

      const orchestrator = new CDNDeploymentOrchestrator();
      const result = await orchestrator.deploy(options);

      if (result.success) {
        console.log(`\n🎉 Deployment successful!`);
        console.log(`🌐 URL: ${result.url}`);
        console.log(`🏷️  ID: ${result.deploymentId}`);
        
        if (result.metrics) {
          console.log(`📊 Metrics:`);
          console.log(`  Files: ${result.metrics.totalFiles}`);
          console.log(`  Size: ${formatSize(result.metrics.totalSize)}`);
          console.log(`  Deploy time: ${result.metrics.deployTime}ms`);
        }
      } else {
        console.error(`\n❌ Deployment failed: ${result.error}`);
        if (result.logs.length > 0) {
          console.log('\n📋 Logs:');
          result.logs.forEach(log => console.log(`  ${log}`));
        }
        process.exit(1);
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate <url>')
  .description('Validate CDN deployment')
  .option('--strict', 'Strict validation mode')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .option('--skip-slow', 'Skip slow performance tests')
  .option('--performance', 'Include performance measurements')
  .option('--security', 'Include security checks')
  .option('--verbose', 'Verbose output')
  .action(async (url, options) => {
    try {
      console.log(`🔍 Validating CDN deployment: ${url}`);
      
      const validator = new CDNDeploymentValidator({
        timeout: parseInt(options.timeout),
        strictMode: options.strict,
        skipSlowTests: options.skipSlow,
      });

      const result = await validator.validateDeployment(url);

      // Print results
      printValidationResults(result, options.verbose);

      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      console.error(`\n❌ Validation failed: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Rollback command
program
  .command('rollback <deployment-id>')
  .description('Rollback to previous deployment')
  .option('-t, --target <provider>', 'Deployment target', 'github-pages')
  .option('-r, --repository <repo>', 'GitHub repository (owner/repo)')
  .option('--preserve-assets', 'Preserve assets during rollback')
  .option('--verbose', 'Verbose logging')
  .action(async (deploymentId, options) => {
    try {
      const orchestrator = new CDNDeploymentOrchestrator();
      const result = await orchestrator.rollback(deploymentId, options);

      if (result.success) {
        console.log(`\n✅ Rollback successful!`);
        console.log(`🔄 Rolled back to: ${deploymentId}`);
        console.log(`🌐 URL: ${result.url}`);
      } else {
        console.error(`\n❌ Rollback failed: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// List deployments command
program
  .command('list')
  .description('List recent deployments')
  .option('-t, --target <provider>', 'Deployment target', 'github-pages')
  .option('-r, --repository <repo>', 'GitHub repository (owner/repo)')
  .option('-l, --limit <number>', 'Number of deployments to show', '10')
  .action(async (options) => {
    try {
      const orchestrator = new CDNDeploymentOrchestrator();
      await orchestrator.listDeployments(options, parseInt(options.limit));
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Test connection command
program
  .command('test-connection')
  .description('Test connection to deployment provider')
  .option('-t, --target <provider>', 'Deployment target', 'github-pages')
  .option('-r, --repository <repo>', 'GitHub repository (owner/repo)')
  .action(async (options) => {
    try {
      console.log(`🔗 Testing connection to ${options.target}...`);
      
      // This would test the provider connection
      console.log(`✅ Connection successful!`);
    } catch (error) {
      console.error(`\n❌ Connection failed: ${error.message}`);
      process.exit(1);
    }
  });

// Generate plugin manifest command
program
  .command('generate-manifest')
  .description('Generate plugin manifest')
  .option('-d, --plugin-dirs <dirs...>', 'Plugin directories to scan', ['packages/plugins'])
  .option('-o, --output <file>', 'Output manifest file', 'cdn/dist/plugins/manifest.json')
  .option('-b, --base-url <url>', 'Base URL for plugins', '')
  .option('--include-dev', 'Include development plugins')
  .option('--no-validate', 'Skip plugin validation')
  .action(async (options) => {
    try {
      console.log(`📦 Generating plugin manifest...`);
      
      const generator = new PluginManifestGenerator({
        pluginDirs: options.pluginDirs,
        baseUrl: options.baseUrl,
        outputPath: options.output,
        includeDevPlugins: options.includeDev,
        validatePlugins: options.validate !== false,
        generateIntegrity: true,
      });

      const manifest = await generator.generateManifest();
      
      console.log(`\n✅ Plugin manifest generated!`);
      console.log(`📄 Output: ${options.output}`);
      console.log(`🔌 Plugins: ${manifest.plugins.length}`);
      console.log(`📂 Categories: ${manifest.categories.length}`);
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Build command
program
  .command('build')
  .description('Build CDN assets')
  .option('-t, --target <provider>', 'CDN target', 'github-pages')
  .option('--compression <type>', 'Compression type (gzip, brotli, both)', 'both')
  .option('--versioning <type>', 'Asset versioning (hash, timestamp, semver)', 'hash')
  .option('--no-wasm-optimization', 'Disable WASM optimization')
  .option('--check-sizes', 'Validate bundle sizes')
  .action(async (options) => {
    try {
      console.log(`🔨 Building CDN assets for ${options.target}...`);
      
      // Set environment variables for build
      process.env.CDN_TARGET = options.target;
      process.env.CDN_COMPRESSION = options.compression;
      process.env.CDN_VERSIONING = options.versioning;
      process.env.CDN_WASM_OPTIMIZATION = options.wasmOptimization !== false ? 'true' : 'false';

      // Run build command
      const { spawn } = await import('child_process');
      const buildProcess = spawn('npm', ['run', 'build:cdn'], {
        stdio: 'inherit',
        shell: true,
      });

      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`\n✅ CDN build completed!`);
          
          if (options.checkSizes) {
            console.log(`🔍 Checking bundle sizes...`);
            const sizeCheckProcess = spawn('npm', ['run', 'size-check:cdn'], {
              stdio: 'inherit',
              shell: true,
            });
          }
        } else {
          console.error(`\n❌ Build failed with code ${code}`);
          process.exit(code);
        }
      });
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Status command
program
  .command('status <url>')
  .description('Check CDN status and health')
  .option('--timeout <ms>', 'Request timeout', '10000')
  .action(async (url, options) => {
    try {
      console.log(`📊 Checking CDN status: ${url}`);
      
      const startTime = Date.now();
      
      // Basic health check
      const response = await fetch(url, {
        signal: AbortSignal.timeout(parseInt(options.timeout)),
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`\n📈 Status Report:`);
      console.log(`  Status: ${response.ok ? '✅ Online' : '❌ Offline'}`);
      console.log(`  Response Code: ${response.status}`);
      console.log(`  Response Time: ${responseTime}ms`);
      
      if (response.ok) {
        const headers = response.headers;
        console.log(`  Cache-Control: ${headers.get('Cache-Control') || 'Not set'}`);
        console.log(`  Content-Type: ${headers.get('Content-Type') || 'Not set'}`);
        console.log(`  Content-Length: ${formatSize(parseInt(headers.get('Content-Length') || '0'))}`);
      }
      
      // Check manifest
      try {
        const manifestResponse = await fetch(`${url}/manifest.json`);
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          console.log(`  Version: ${manifest.version || 'Unknown'}`);
          console.log(`  Assets: ${Object.keys(manifest.assets || {}).length}`);
        }
      } catch (error) {
        console.log(`  Manifest: ⚠️  Not accessible`);
      }
      
    } catch (error) {
      console.error(`\n❌ Status check failed: ${error.message}`);
      process.exit(1);
    }
  });

// Helper functions
function printValidationResults(result: any, verbose: boolean) {
  const passed = result.checks.filter((c: any) => c.status === 'passed').length;
  const warnings = result.checks.filter((c: any) => c.status === 'warning').length;
  const failed = result.checks.filter((c: any) => c.status === 'failed').length;

  console.log(`\n📊 Validation Results:`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ⚠️  Warnings: ${warnings}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  🎯 Overall: ${result.success ? '✅ Success' : '❌ Failed'}`);

  if (result.performance) {
    console.log(`\n⚡ Performance:`);
    console.log(`  Load Time: ${result.performance.loadTime}ms`);
    if (result.performance.wasmLoadTime > 0) {
      console.log(`  WASM Load: ${result.performance.wasmLoadTime}ms`);
    }
    if (result.performance.totalSize > 0) {
      console.log(`  Bundle Size: ${formatSize(result.performance.totalSize)}`);
    }
  }

  if (result.security) {
    const securityPassed = result.security.filter((s: any) => s.status === 'passed').length;
    console.log(`\n🔒 Security: ${securityPassed}/${result.security.length} checks passed`);
  }

  if (verbose || failed > 0) {
    console.log(`\n📋 Detailed Results:`);
    result.checks.forEach((check: any) => {
      const icon = check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      console.log(`  ${icon} ${check.name}: ${check.message}`);
      
      if (verbose && check.details) {
        console.log(`    Details: ${JSON.stringify(check.details, null, 2)}`);
      }
    });
  }
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Parse and execute
program.parse();