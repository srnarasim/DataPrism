import { DataPrismError } from "./types.js";
import { DependencyRegistry, DependencyMetadata } from "./dependency-registry.js";

export interface EnhancedError extends DataPrismError {
  dependency?: string;
  retryCount?: number;
  troubleshooting?: string[];
  context?: {
    loadTime?: number;
    browserInfo?: string;
    networkStatus?: string;
    cdnStatus?: string;
  };
}

export class DependencyErrorHandler {
  private static instance: DependencyErrorHandler;
  private registry: DependencyRegistry;

  private constructor() {
    this.registry = DependencyRegistry.getInstance();
  }

  static getInstance(): DependencyErrorHandler {
    if (!DependencyErrorHandler.instance) {
      DependencyErrorHandler.instance = new DependencyErrorHandler();
    }
    return DependencyErrorHandler.instance;
  }

  createDependencyError(
    dependency: string,
    originalError: Error,
    metadata?: DependencyMetadata
  ): EnhancedError {
    const enhancedError: EnhancedError = {
      message: this.createContextualMessage(dependency, originalError, metadata),
      code: this.getDependencyErrorCode(dependency, originalError),
      source: "orchestration",
      dependency,
      retryCount: metadata?.retryCount || 0,
      troubleshooting: this.getTroubleshootingSteps(dependency, originalError),
      context: this.gatherContext(dependency, metadata),
    };

    return enhancedError;
  }

  private createContextualMessage(
    dependency: string,
    originalError: Error,
    metadata?: DependencyMetadata
  ): string {
    const baseMessage = `Failed to load dependency '${dependency}': ${originalError.message}`;
    
    if (!metadata) {
      return baseMessage;
    }

    const loadTime = metadata.loadEndTime ? 
      metadata.loadEndTime - metadata.loadStartTime : 
      Date.now() - metadata.loadStartTime;

    let contextMessage = baseMessage;
    
    if (metadata.retryCount > 0) {
      contextMessage += ` (Retry ${metadata.retryCount}/${metadata.maxRetries})`;
    }

    if (loadTime > 10000) {
      contextMessage += ` - Loading took ${Math.round(loadTime / 1000)}s`;
    }

    if (metadata.requiredFor.length > 0) {
      contextMessage += ` - Required for: ${metadata.requiredFor.join(", ")}`;
    }

    return contextMessage;
  }

  private getDependencyErrorCode(dependency: string, error: Error): string {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes("timeout")) {
      return `${dependency.toUpperCase()}_TIMEOUT`;
    }
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return `${dependency.toUpperCase()}_NETWORK_ERROR`;
    }
    
    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      return `${dependency.toUpperCase()}_NOT_FOUND`;
    }
    
    if (errorMessage.includes("cors") || errorMessage.includes("cross-origin")) {
      return `${dependency.toUpperCase()}_CORS_ERROR`;
    }
    
    if (errorMessage.includes("import") || errorMessage.includes("module")) {
      return `${dependency.toUpperCase()}_IMPORT_ERROR`;
    }
    
    return `${dependency.toUpperCase()}_LOAD_ERROR`;
  }

  private getTroubleshootingSteps(dependency: string, error: Error): string[] {
    const steps: string[] = [];
    const errorMessage = error.message.toLowerCase();

    // Common troubleshooting steps
    steps.push("Check your internet connection");
    steps.push("Verify the dependency version is compatible");

    // Dependency-specific troubleshooting
    switch (dependency) {
      case "apache-arrow":
        steps.push("Ensure Apache Arrow is available in your build configuration");
        steps.push("Check if Arrow is properly externalized in your bundler");
        steps.push("Verify CORS headers if loading from CDN");
        steps.push("Try loading from a different CDN (JSDelivr, unpkg)");
        
        if (errorMessage.includes("recordbatchreader")) {
          steps.push("The RecordBatchReader is not available - Arrow may not be fully loaded");
          steps.push("Try calling await engine.waitForArrow() before using Arrow features");
        }
        break;

      case "duckdb":
        steps.push("Check if DuckDB WASM files are accessible");
        steps.push("Verify SharedArrayBuffer is available for multi-threading");
        steps.push("Check COEP/COOP headers for cross-origin isolation");
        steps.push("Try fallback to single-threaded mode");
        break;

      case "wasm-core":
        steps.push("Verify WASM files are built and accessible");
        steps.push("Check if WebAssembly is supported in your browser");
        steps.push("Ensure WASM files are served with correct MIME type");
        break;
    }

    // Error-specific troubleshooting
    if (errorMessage.includes("timeout")) {
      steps.push("Increase timeout duration in configuration");
      steps.push("Check if CDN is experiencing issues");
    }

    if (errorMessage.includes("cors")) {
      steps.push("Configure CORS headers on your server");
      steps.push("Use same-origin resources when possible");
    }

    if (errorMessage.includes("network")) {
      steps.push("Check firewall and proxy settings");
      steps.push("Try using a different network");
    }

    return steps;
  }

  private gatherContext(dependency: string, metadata?: DependencyMetadata): any {
    const context: any = {};

    if (metadata) {
      context.loadTime = metadata.loadEndTime ? 
        metadata.loadEndTime - metadata.loadStartTime : 
        Date.now() - metadata.loadStartTime;
    }

    // Browser context
    if (typeof window !== "undefined") {
      context.browserInfo = `${navigator.userAgent}`;
      context.networkStatus = navigator.onLine ? "online" : "offline";
      
      // WebAssembly support
      if (dependency === "wasm-core") {
        context.wasmSupport = typeof WebAssembly !== "undefined";
      }
      
      // SharedArrayBuffer support (for DuckDB)
      if (dependency === "duckdb") {
        context.sharedArrayBufferSupport = typeof SharedArrayBuffer !== "undefined";
        context.crossOriginIsolated = window.crossOriginIsolated;
      }
    }

    return context;
  }

  formatErrorForLogging(error: EnhancedError): string {
    let formatted = `[${error.code}] ${error.message}`;

    if (error.context) {
      formatted += "\n  Context:";
      Object.entries(error.context).forEach(([key, value]) => {
        formatted += `\n    ${key}: ${value}`;
      });
    }

    if (error.troubleshooting && error.troubleshooting.length > 0) {
      formatted += "\n  Troubleshooting:";
      error.troubleshooting.forEach((step, index) => {
        formatted += `\n    ${index + 1}. ${step}`;
      });
    }

    return formatted;
  }

  createRetryStrategy(
    dependency: string,
    error: Error,
    retryCount: number
  ): {
    shouldRetry: boolean;
    delay: number;
    maxRetries: number;
  } {
    const errorMessage = error.message.toLowerCase();
    
    // Base retry configuration
    let shouldRetry = true;
    let delay = 1000 * Math.pow(2, retryCount); // Exponential backoff
    let maxRetries = 3;

    // Dependency-specific retry logic
    switch (dependency) {
      case "apache-arrow":
        maxRetries = 4; // Arrow can be retried more times
        if (errorMessage.includes("not found")) {
          shouldRetry = false; // Don't retry if Arrow is not found
        }
        break;

      case "duckdb":
        maxRetries = 3;
        if (errorMessage.includes("sharedarraybuffer")) {
          shouldRetry = false; // Can't retry browser support issues
        }
        break;

      case "wasm-core":
        maxRetries = 2;
        if (errorMessage.includes("webassembly")) {
          shouldRetry = false; // Can't retry browser support issues
        }
        break;
    }

    // Error-specific retry logic
    if (errorMessage.includes("timeout")) {
      delay = Math.min(delay * 1.5, 10000); // Longer delays for timeouts
    }

    if (errorMessage.includes("cors")) {
      shouldRetry = false; // CORS errors won't resolve with retries
    }

    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      shouldRetry = false; // Don't retry missing resources
    }

    return {
      shouldRetry: shouldRetry && retryCount < maxRetries,
      delay: Math.min(delay, 10000), // Cap at 10 seconds
      maxRetries,
    };
  }

  logDependencyError(error: EnhancedError): void {
    const formatted = this.formatErrorForLogging(error);
    
    if (error.retryCount === 0) {
      console.error("[DataPrism] Dependency Error:", formatted);
    } else {
      console.warn(`[DataPrism] Dependency Retry ${error.retryCount}:`, formatted);
    }
  }

  createUserFriendlyMessage(error: EnhancedError): string {
    const dependency = error.dependency || "unknown";
    
    let message = `We're having trouble loading ${dependency}. `;
    
    if (error.context?.networkStatus === "offline") {
      message += "Please check your internet connection and try again.";
    } else if (error.code.includes("TIMEOUT")) {
      message += "The loading process is taking longer than expected. Please try again.";
    } else if (error.code.includes("CORS")) {
      message += "There's a configuration issue with cross-origin requests. Please contact support.";
    } else {
      message += "Please try refreshing the page or contact support if the problem persists.";
    }

    return message;
  }
}