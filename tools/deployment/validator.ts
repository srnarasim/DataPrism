/**
 * CDN Deployment Validator
 * Comprehensive validation system for CDN deployments
 */

import {
  ValidationResult,
  ValidationCheck,
  PerformanceMetrics,
  SecurityCheck,
  VALIDATION_CHECKS,
} from './types.js';

export interface ValidatorOptions {
  timeout?: number;
  retries?: number;
  strictMode?: boolean;
  skipSlowTests?: boolean;
  customChecks?: ValidationCheck[];
}

export class CDNDeploymentValidator {
  private options: Required<ValidatorOptions>;

  constructor(options: ValidatorOptions = {}) {
    this.options = {
      timeout: 30000,
      retries: 3,
      strictMode: false,
      skipSlowTests: false,
      customChecks: [],
      ...options,
    };
  }

  /**
   * Run comprehensive validation of a CDN deployment
   */
  async validateDeployment(url: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const checks: ValidationCheck[] = [];
    let performance: PerformanceMetrics | undefined;
    let security: SecurityCheck[] = [];

    try {
      console.log(`🔍 Starting CDN validation for: ${url}`);

      // Basic connectivity and health checks
      checks.push(...await this.runConnectivityChecks(url));

      // Asset validation
      checks.push(...await this.runAssetValidation(url));

      // WASM-specific validation
      checks.push(...await this.runWasmValidation(url));

      // DuckDB-specific validation
      checks.push(...await this.runDuckDBValidation(url));

      // Plugin system validation
      checks.push(...await this.runPluginValidation(url));

      // Security validation
      security = await this.runSecurityValidation(url);

      // Performance measurement (unless skipped)
      if (!this.options.skipSlowTests) {
        performance = await this.measurePerformance(url);
        checks.push(...this.validatePerformanceMetrics(performance));
      }

      // Custom validation checks
      if (this.options.customChecks.length > 0) {
        checks.push(...this.options.customChecks);
      }

      const duration = Date.now() - startTime;
      const success = this.determineOverallSuccess(checks, security);

      console.log(`${success ? '✅' : '❌'} Validation completed in ${duration}ms`);
      this.printValidationSummary(checks, security, performance);

      return {
        success,
        checks,
        performance,
        security,
      };

    } catch (error) {
      console.error('❌ Validation failed with error:', error.message);
      
      checks.push({
        name: 'validation-error',
        status: 'failed',
        message: `Validation failed: ${error.message}`,
      });

      return {
        success: false,
        checks,
        performance,
        security,
      };
    }
  }

  /**
   * Basic connectivity and health checks
   */
  private async runConnectivityChecks(url: string): Promise<ValidationCheck[]> {
    const checks: ValidationCheck[] = [];

    // Test main URL accessibility
    checks.push(await this.checkUrlAccessible(url, 'main-url'));

    // Test manifest accessibility
    checks.push(await this.checkUrlAccessible(`${url}/manifest.json`, 'manifest'));

    // Test CORS headers
    checks.push(await this.checkCORSHeaders(url));

    // Test cache headers
    checks.push(await this.checkCacheHeaders(url));

    return checks;
  }

  /**
   * Asset validation checks
   */
  private async runAssetValidation(url: string): Promise<ValidationCheck[]> {
    const checks: ValidationCheck[] = [];

    try {
      // Fetch and validate manifest
      const manifest = await this.fetchManifest(url);
      checks.push({
        name: VALIDATION_CHECKS.ASSET_INTEGRITY,
        status: 'passed',
        message: 'Asset manifest is valid and accessible',
        details: { assetCount: Object.keys(manifest.assets || {}).length },
      });

      // Validate core assets
      const coreAssets = ['core.min.js', 'orchestration.min.js', 'plugin-framework.min.js'];
      for (const asset of coreAssets) {
        checks.push(await this.validateAsset(url, asset, manifest));
      }

      // Validate asset integrity hashes
      checks.push(await this.validateAssetIntegrity(url, manifest));

    } catch (error) {
      checks.push({
        name: VALIDATION_CHECKS.ASSET_INTEGRITY,
        status: 'failed',
        message: `Asset validation failed: ${error.message}`,
      });
    }

    return checks;
  }

  /**
   * WASM-specific validation
   */
  private async runWasmValidation(url: string): Promise<ValidationCheck[]> {
    const checks: ValidationCheck[] = [];

    try {
      // Check WASM file accessibility
      const wasmUrls = [
        `${url}/assets/dataprism-core.wasm`,
        `${url}/assets/dataprism_core_bg.wasm`,
      ];

      let wasmFound = false;
      for (const wasmUrl of wasmUrls) {
        try {
          const response = await this.fetchWithTimeout(wasmUrl);
          if (response.ok) {
            wasmFound = true;
            
            // Check MIME type
            const contentType = response.headers.get('Content-Type');
            const correctMime = contentType === 'application/wasm';
            
            checks.push({
              name: VALIDATION_CHECKS.WASM_LOADING,
              status: correctMime ? 'passed' : 'warning',
              message: correctMime 
                ? 'WASM file accessible with correct MIME type'
                : `WASM file accessible but incorrect MIME type: ${contentType}`,
              details: { url: wasmUrl, contentType },
            });

            // Check streaming compilation headers
            const coep = response.headers.get('Cross-Origin-Embedder-Policy');
            const coop = response.headers.get('Cross-Origin-Opener-Policy');
            
            checks.push({
              name: 'wasm-streaming-headers',
              status: (coep && coop) ? 'passed' : 'warning',
              message: (coep && coop)
                ? 'WASM streaming compilation headers are configured'
                : 'Missing headers for WASM streaming compilation',
              details: { coep, coop },
            });

            break;
          }
        } catch (error) {
          // Continue to next WASM URL
        }
      }

      if (!wasmFound) {
        checks.push({
          name: VALIDATION_CHECKS.WASM_LOADING,
          status: 'warning',
          message: 'No WASM files found at expected locations',
          details: { searchedUrls: wasmUrls },
        });
      }

    } catch (error) {
      checks.push({
        name: VALIDATION_CHECKS.WASM_LOADING,
        status: 'failed',
        message: `WASM validation failed: ${error.message}`,
      });
    }

    return checks;
  }

  /**
   * DuckDB-specific validation
   */
  private async runDuckDBValidation(url: string): Promise<ValidationCheck[]> {
    const checks: ValidationCheck[] = [];

    try {
      // Check for DuckDB configuration file
      const configCheck = await this.checkUrlAccessible(`${url}/duckdb-config.json`, 'duckdb-config');
      checks.push({
        ...configCheck,
        name: 'duckdb-config',
        message: configCheck.status === 'passed' 
          ? 'DuckDB configuration is accessible'
          : 'DuckDB configuration missing - will fallback to JSDelivr',
      });

      // Check for DuckDB worker assets (WASM files are loaded from JSDelivr in hybrid mode)
      const duckdbAssets = [
        'assets/duckdb-browser-mvp.worker.js',
        'assets/duckdb-browser-eh.worker.js',
        'assets/duckdb-browser-coi.worker.js',
        'assets/duckdb-browser-coi.pthread.worker.js'
      ];

      let foundAssets = 0;
      for (const asset of duckdbAssets) {
        try {
          const response = await this.fetchWithTimeout(`${url}/${asset}`);
          if (response.ok) {
            foundAssets++;
            checks.push({
              name: `duckdb-asset-${asset.split('/').pop()?.replace('.', '-')}`,
              status: 'passed',
              message: `DuckDB asset ${asset} is accessible`,
              details: { url: `${url}/${asset}` },
            });
          }
        } catch (error) {
          checks.push({
            name: `duckdb-worker-${asset.split('/').pop()?.replace('.', '-')}`,
            status: 'warning',
            message: `DuckDB worker ${asset} not accessible - will use JSDelivr fallback`,
            details: { url: `${url}/${asset}`, error: error.message },
          });
        }
      }

      // Overall DuckDB bundle assessment
      checks.push({
        name: 'duckdb-hybrid-deployment',
        status: foundAssets >= 3 ? 'passed' : 'warning',
        message: foundAssets >= 3 
          ? `Hybrid DuckDB deployment ready (${foundAssets}/${duckdbAssets.length} workers from CDN, WASM from JSDelivr)`
          : foundAssets > 0
          ? `Partial DuckDB deployment (${foundAssets}/${duckdbAssets.length} workers) - using JSDelivr fallback`
          : 'No DuckDB workers found - using full JSDelivr fallback',
        details: { foundWorkers: foundAssets, totalWorkers: duckdbAssets.length, strategy: 'hybrid' },
      });

      // Validate DuckDB configuration if available
      if (configCheck.status === 'passed') {
        try {
          const configResponse = await fetch(`${url}/duckdb-config.json`);
          const config = await configResponse.json();
          
          // Validate config structure for hybrid deployment
          const isHybrid = config.hybrid === true;
          const hasValidStructure = config.baseUrl !== undefined && 
                                   (isHybrid ? config.workers : (config.assets && config.bundles));
          
          checks.push({
            name: 'duckdb-config-validation',
            status: hasValidStructure ? 'passed' : 'failed',
            message: hasValidStructure 
              ? `DuckDB configuration is valid (${isHybrid ? 'hybrid' : 'full CDN'} mode)`
              : 'DuckDB configuration has invalid structure',
            details: { configKeys: Object.keys(config), hybrid: isHybrid },
          });

          // Check hybrid configuration
          if (isHybrid && config.workers) {
            const configWorkers = Object.values(config.workers) as string[];
            
            checks.push({
              name: 'duckdb-hybrid-config',
              status: 'passed',
              message: `Hybrid DuckDB configuration: ${configWorkers.length} workers defined, WASM from ${config.fallback?.strategy || 'JSDelivr'}`,
              details: { 
                workers: configWorkers.length, 
                wasmSource: config.fallback?.strategy || 'JSDelivr',
                note: config.fallback?.note 
              },
            });
          }

        } catch (error) {
          checks.push({
            name: 'duckdb-config-validation',
            status: 'failed',
            message: `Failed to validate DuckDB configuration: ${error.message}`,
          });
        }
      }

    } catch (error) {
      checks.push({
        name: 'duckdb-validation-error',
        status: 'failed',
        message: `DuckDB validation failed: ${error.message}`,
      });
    }

    return checks;
  }

  /**
   * Plugin system validation
   */
  private async runPluginValidation(url: string): Promise<ValidationCheck[]> {
    const checks: ValidationCheck[] = [];

    try {
      // Check plugin framework accessibility
      const pluginFrameworkUrl = `${url}/plugin-framework.min.js`;
      const response = await this.fetchWithTimeout(pluginFrameworkUrl);
      
      checks.push({
        name: VALIDATION_CHECKS.PLUGIN_LOADING,
        status: response.ok ? 'passed' : 'failed',
        message: response.ok 
          ? 'Plugin framework is accessible'
          : 'Plugin framework not accessible',
        details: { url: pluginFrameworkUrl, status: response.status },
      });

      // Check for plugin directory
      try {
        const pluginDirResponse = await this.fetchWithTimeout(`${url}/plugins/`);
        checks.push({
          name: 'plugin-directory',
          status: pluginDirResponse.ok ? 'passed' : 'warning',
          message: pluginDirResponse.ok
            ? 'Plugin directory is accessible'
            : 'Plugin directory not found (may be expected)',
        });
      } catch (error) {
        // Plugin directory not found is not necessarily an error
        checks.push({
          name: 'plugin-directory',
          status: 'warning',
          message: 'Plugin directory not accessible (may be expected)',
        });
      }

    } catch (error) {
      checks.push({
        name: VALIDATION_CHECKS.PLUGIN_LOADING,
        status: 'failed',
        message: `Plugin validation failed: ${error.message}`,
      });
    }

    return checks;
  }

  /**
   * Security validation
   */
  private async runSecurityValidation(url: string): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    try {
      const response = await this.fetchWithTimeout(url);
      const headers = response.headers;

      // Check security headers
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': ['DENY', 'SAMEORIGIN'],
        'X-XSS-Protection': '1; mode=block',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      };

      for (const [headerName, expectedValue] of Object.entries(securityHeaders)) {
        const actualValue = headers.get(headerName);
        const isArray = Array.isArray(expectedValue);
        const isValid = isArray 
          ? expectedValue.includes(actualValue)
          : actualValue === expectedValue;

        checks.push({
          name: `security-header-${headerName.toLowerCase()}`,
          status: actualValue ? (isValid ? 'passed' : 'warning') : 'failed',
          description: `${headerName} header validation`,
          recommendation: actualValue 
            ? (isValid ? undefined : `Consider setting to: ${isArray ? expectedValue.join(' or ') : expectedValue}`)
            : `Add ${headerName}: ${isArray ? expectedValue[0] : expectedValue}`,
        });
      }

      // Check HTTPS enforcement
      checks.push({
        name: 'https-enforcement',
        status: url.startsWith('https://') ? 'passed' : 'failed',
        description: 'HTTPS protocol enforcement',
        recommendation: url.startsWith('https://') 
          ? undefined 
          : 'Ensure CDN enforces HTTPS for all requests',
      });

      // Check for sensitive information exposure
      checks.push(await this.checkSensitiveInfoExposure(url));

    } catch (error) {
      checks.push({
        name: 'security-validation-error',
        status: 'failed',
        description: `Security validation failed: ${error.message}`,
        recommendation: 'Investigate and resolve security validation errors',
      });
    }

    return checks;
  }

  /**
   * Performance measurement
   */
  private async measurePerformance(url: string): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      loadTime: 0,
      wasmLoadTime: 0,
      pluginLoadTimes: {},
      totalSize: 0,
      compressionRatio: 0,
    };

    try {
      // Measure core bundle load time
      const start = Date.now();
      const coreResponse = await this.fetchWithTimeout(`${url}/core.min.js`);
      metrics.loadTime = Date.now() - start;

      // Get bundle size
      const contentLength = coreResponse.headers.get('Content-Length');
      if (contentLength) {
        metrics.totalSize = parseInt(contentLength);
      }

      // Measure WASM load time
      try {
        const wasmStart = Date.now();
        await this.fetchWithTimeout(`${url}/assets/dataprism-core.wasm`);
        metrics.wasmLoadTime = Date.now() - wasmStart;
      } catch (error) {
        // WASM not found or failed to load
        metrics.wasmLoadTime = -1;
      }

      // Estimate compression ratio
      if (metrics.totalSize > 0) {
        const uncompressedEstimate = metrics.totalSize * 1.4; // Rough estimate
        metrics.compressionRatio = metrics.totalSize / uncompressedEstimate;
      }

    } catch (error) {
      console.warn('Performance measurement failed:', error.message);
    }

    return metrics;
  }

  /**
   * Helper methods
   */
  private async fetchWithTimeout(url: string, timeoutMs: number = this.options.timeout): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        method: 'HEAD',
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async checkUrlAccessible(url: string, name: string): Promise<ValidationCheck> {
    try {
      const response = await this.fetchWithTimeout(url);
      return {
        name: `connectivity-${name}`,
        status: response.ok ? 'passed' : 'failed',
        message: response.ok 
          ? `${name} is accessible`
          : `${name} returned ${response.status}`,
        details: { url, status: response.status },
      };
    } catch (error) {
      return {
        name: `connectivity-${name}`,
        status: 'failed',
        message: `Failed to access ${name}: ${error.message}`,
        details: { url, error: error.message },
      };
    }
  }

  private async checkCORSHeaders(url: string): Promise<ValidationCheck> {
    try {
      const response = await fetch(url, { method: 'OPTIONS' });
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      
      return {
        name: VALIDATION_CHECKS.CORS_HEADERS,
        status: corsHeader ? 'passed' : 'warning',
        message: corsHeader 
          ? 'CORS headers are configured'
          : 'CORS headers not found - may cause cross-origin issues',
        details: { corsHeader },
      };
    } catch (error) {
      return {
        name: VALIDATION_CHECKS.CORS_HEADERS,
        status: 'failed',
        message: `CORS validation failed: ${error.message}`,
      };
    }
  }

  private async checkCacheHeaders(url: string): Promise<ValidationCheck> {
    try {
      const response = await this.fetchWithTimeout(url);
      const cacheControl = response.headers.get('Cache-Control');
      
      return {
        name: VALIDATION_CHECKS.CACHE_HEADERS,
        status: cacheControl ? 'passed' : 'warning',
        message: cacheControl
          ? 'Cache headers are configured'
          : 'Cache headers not found - performance may be impacted',
        details: { cacheControl },
      };
    } catch (error) {
      return {
        name: VALIDATION_CHECKS.CACHE_HEADERS,
        status: 'failed',
        message: `Cache header validation failed: ${error.message}`,
      };
    }
  }

  private async fetchManifest(url: string): Promise<any> {
    const response = await this.fetchWithTimeout(`${url}/manifest.json`);
    if (!response.ok) {
      throw new Error(`Manifest not accessible: ${response.status}`);
    }
    
    // For HEAD request, we need to do a GET to read the body
    const getResponse = await fetch(`${url}/manifest.json`);
    return getResponse.json();
  }

  private async validateAsset(url: string, assetPath: string, manifest: any): Promise<ValidationCheck> {
    try {
      const assetUrl = `${url}/${assetPath}`;
      const response = await this.fetchWithTimeout(assetUrl);
      
      return {
        name: `asset-${assetPath.replace(/[^a-zA-Z0-9]/g, '-')}`,
        status: response.ok ? 'passed' : 'failed',
        message: response.ok 
          ? `Asset ${assetPath} is accessible`
          : `Asset ${assetPath} not accessible`,
        details: { url: assetUrl, status: response.status },
      };
    } catch (error) {
      return {
        name: `asset-${assetPath.replace(/[^a-zA-Z0-9]/g, '-')}`,
        status: 'failed',
        message: `Asset ${assetPath} validation failed: ${error.message}`,
      };
    }
  }

  private async validateAssetIntegrity(url: string, manifest: any): Promise<ValidationCheck> {
    if (!manifest.integrity || Object.keys(manifest.integrity).length === 0) {
      return {
        name: 'asset-integrity-hashes',
        status: 'warning',
        message: 'No integrity hashes found in manifest',
      };
    }

    return {
      name: 'asset-integrity-hashes',
      status: 'passed',
      message: `Integrity hashes available for ${Object.keys(manifest.integrity).length} assets`,
      details: { hashCount: Object.keys(manifest.integrity).length },
    };
  }

  private async checkSensitiveInfoExposure(url: string): Promise<SecurityCheck> {
    try {
      // Check for common sensitive files
      const sensitiveFiles = ['.env', 'config.json', 'secrets.json', '.git/config'];
      
      for (const file of sensitiveFiles) {
        try {
          const response = await this.fetchWithTimeout(`${url}/${file}`);
          if (response.ok) {
            return {
              name: 'sensitive-info-exposure',
              status: 'failed',
              description: `Sensitive file exposed: ${file}`,
              recommendation: `Remove or block access to ${file}`,
            };
          }
        } catch (error) {
          // Expected - file should not be accessible
        }
      }

      return {
        name: 'sensitive-info-exposure',
        status: 'passed',
        description: 'No sensitive files exposed',
      };
    } catch (error) {
      return {
        name: 'sensitive-info-exposure',
        status: 'warning',
        description: `Could not check for sensitive file exposure: ${error.message}`,
        recommendation: 'Manually verify no sensitive files are exposed',
      };
    }
  }

  private validatePerformanceMetrics(performance: PerformanceMetrics): ValidationCheck[] {
    const checks: ValidationCheck[] = [];

    // Check load time
    if (performance.loadTime > 0) {
      checks.push({
        name: VALIDATION_CHECKS.PERFORMANCE,
        status: performance.loadTime < 5000 ? 'passed' : 'warning',
        message: `Core bundle load time: ${performance.loadTime}ms`,
        details: { loadTime: performance.loadTime, target: 5000 },
      });
    }

    // Check WASM load time
    if (performance.wasmLoadTime > 0) {
      checks.push({
        name: 'performance-wasm-load',
        status: performance.wasmLoadTime < 2000 ? 'passed' : 'warning',
        message: `WASM load time: ${performance.wasmLoadTime}ms`,
        details: { wasmLoadTime: performance.wasmLoadTime, target: 2000 },
      });
    }

    return checks;
  }

  private determineOverallSuccess(checks: ValidationCheck[], security: SecurityCheck[]): boolean {
    if (this.options.strictMode) {
      // In strict mode, all checks must pass
      return checks.every(check => check.status === 'passed') &&
             security.every(check => check.status === 'passed');
    } else {
      // In normal mode, no failed checks allowed (warnings are OK)
      return checks.every(check => check.status !== 'failed') &&
             security.every(check => check.status !== 'failed');
    }
  }

  private printValidationSummary(
    checks: ValidationCheck[], 
    security: SecurityCheck[], 
    performance?: PerformanceMetrics
  ): void {
    const passed = checks.filter(c => c.status === 'passed').length;
    const warnings = checks.filter(c => c.status === 'warning').length;
    const failed = checks.filter(c => c.status === 'failed').length;

    console.log('\n📊 Validation Summary:');
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ⚠️  Warnings: ${warnings}`);
    console.log(`  ❌ Failed: ${failed}`);

    if (performance) {
      console.log('\n⚡ Performance:');
      console.log(`  Load Time: ${performance.loadTime}ms`);
      if (performance.wasmLoadTime > 0) {
        console.log(`  WASM Load: ${performance.wasmLoadTime}ms`);
      }
      if (performance.totalSize > 0) {
        console.log(`  Bundle Size: ${Math.round(performance.totalSize / 1024)}KB`);
      }
    }

    console.log(`\n🔒 Security: ${security.filter(s => s.status === 'passed').length}/${security.length} checks passed`);
  }
}