import {
  CDNDeploymentProvider,
  AssetBundle,
  DeploymentConfig,
  DeploymentResult,
  ValidationResult,
  DeploymentStatus,
  DeploymentInfo,
  RollbackOptions,
  CDNProviderOptions,
  ValidationCheck,
  PerformanceMetrics,
  SecurityCheck,
  VALIDATION_CHECKS,
} from '../types.js';

export abstract class BaseDeploymentProvider extends CDNDeploymentProvider {
  protected options: CDNProviderOptions;
  protected logger: Logger;

  constructor(options: CDNProviderOptions = {}) {
    super();
    this.options = {
      timeout: 300000, // 5 minutes
      retries: 3,
      ...options,
    };
    this.logger = new Logger(this.name);
  }

  /**
   * Common validation logic for all providers
   */
  protected async runCommonValidations(
    url: string,
    config: DeploymentConfig
  ): Promise<ValidationCheck[]> {
    const checks: ValidationCheck[] = [];

    try {
      // Test basic connectivity
      checks.push(await this.validateConnectivity(url));

      // Validate CORS headers
      checks.push(await this.validateCORSHeaders(url));

      // Validate cache headers
      checks.push(await this.validateCacheHeaders(url));

      // Validate WASM loading
      checks.push(await this.validateWasmLoading(url));

      // Validate security headers
      checks.push(await this.validateSecurityHeaders(url));

    } catch (error) {
      checks.push({
        name: 'validation-error',
        status: 'failed',
        message: `Validation failed: ${error.message}`,
      });
    }

    return checks;
  }

  protected async validateConnectivity(url: string): Promise<ValidationCheck> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) 
      });
      
      return {
        name: VALIDATION_CHECKS.CORS_HEADERS,
        status: response.ok ? 'passed' : 'failed',
        message: response.ok 
          ? 'CDN endpoint is accessible'
          : `CDN endpoint returned ${response.status}`,
      };
    } catch (error) {
      return {
        name: 'connectivity',
        status: 'failed',
        message: `Failed to connect to CDN: ${error.message}`,
      };
    }
  }

  protected async validateCORSHeaders(url: string): Promise<ValidationCheck> {
    try {
      const response = await fetch(url, { method: 'OPTIONS' });
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      
      return {
        name: VALIDATION_CHECKS.CORS_HEADERS,
        status: corsHeader ? 'passed' : 'warning',
        message: corsHeader 
          ? 'CORS headers are properly configured'
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

  protected async validateCacheHeaders(url: string): Promise<ValidationCheck> {
    try {
      const response = await fetch(url);
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

  protected async validateWasmLoading(url: string): Promise<ValidationCheck> {
    try {
      // Try to fetch a WASM file if it exists
      const wasmUrl = new URL('/assets/dataprism-core.wasm', url);
      const response = await fetch(wasmUrl.toString());
      
      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        const isValidMime = contentType === 'application/wasm';
        
        return {
          name: VALIDATION_CHECKS.WASM_LOADING,
          status: isValidMime ? 'passed' : 'warning',
          message: isValidMime
            ? 'WASM files are served with correct MIME type'
            : 'WASM files may not have correct MIME type',
          details: { contentType },
        };
      }
      
      return {
        name: VALIDATION_CHECKS.WASM_LOADING,
        status: 'warning',
        message: 'WASM files not found or not accessible',
      };
    } catch (error) {
      return {
        name: VALIDATION_CHECKS.WASM_LOADING,
        status: 'failed',
        message: `WASM validation failed: ${error.message}`,
      };
    }
  }

  protected async validateSecurityHeaders(url: string): Promise<ValidationCheck> {
    try {
      const response = await fetch(url);
      const headers = response.headers;
      
      const securityHeaders = {
        'X-Content-Type-Options': headers.get('X-Content-Type-Options'),
        'X-Frame-Options': headers.get('X-Frame-Options'),
        'X-XSS-Protection': headers.get('X-XSS-Protection'),
        'Cross-Origin-Embedder-Policy': headers.get('Cross-Origin-Embedder-Policy'),
        'Cross-Origin-Opener-Policy': headers.get('Cross-Origin-Opener-Policy'),
      };
      
      const missingHeaders = Object.entries(securityHeaders)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      
      return {
        name: VALIDATION_CHECKS.SECURITY,
        status: missingHeaders.length === 0 ? 'passed' : 'warning',
        message: missingHeaders.length === 0
          ? 'Security headers are properly configured'
          : `Missing security headers: ${missingHeaders.join(', ')}`,
        details: { securityHeaders, missingHeaders },
      };
    } catch (error) {
      return {
        name: VALIDATION_CHECKS.SECURITY,
        status: 'failed',
        message: `Security header validation failed: ${error.message}`,
      };
    }
  }

  protected async measurePerformance(url: string): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    try {
      // Measure main bundle load time
      const response = await fetch(url);
      const loadTime = Date.now() - startTime;
      
      const contentLength = response.headers.get('Content-Length');
      const totalSize = contentLength ? parseInt(contentLength) : 0;
      
      // Try to measure WASM load time
      let wasmLoadTime = 0;
      try {
        const wasmStart = Date.now();
        const wasmUrl = new URL('/assets/dataprism-core.wasm', url);
        await fetch(wasmUrl.toString());
        wasmLoadTime = Date.now() - wasmStart;
      } catch {
        // WASM not found or failed to load
      }
      
      return {
        loadTime,
        wasmLoadTime,
        pluginLoadTimes: {}, // Would be measured for actual plugins
        totalSize,
        compressionRatio: 0.7, // Estimated
      };
    } catch (error) {
      return {
        loadTime: -1,
        wasmLoadTime: -1,
        pluginLoadTimes: {},
        totalSize: 0,
        compressionRatio: 0,
      };
    }
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.options.retries || 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  protected generateDeploymentId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `deploy_${timestamp}_${random}`;
  }

  protected createError(message: string, details?: any): Error {
    const error = new Error(message);
    if (details) {
      (error as any).details = details;
    }
    return error;
  }
}

class Logger {
  constructor(private provider: string) {}

  info(message: string, ...args: any[]) {
    console.log(`[${this.provider}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.provider}] ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[${this.provider}] ${message}`, ...args);
  }
}