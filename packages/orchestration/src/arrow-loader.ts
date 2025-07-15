import { DependencyRegistry } from "./dependency-registry.js";
import { DataPrismError } from "./types.js";

export interface ArrowModule {
  Table: any;
  RecordBatch: any;
  RecordBatchReader: any;
  Schema: any;
  Field: any;
  Vector: any;
  Type: any;
  util: any;
  version?: string;
}

export class ArrowLoader {
  private static instance: ArrowLoader;
  private registry: DependencyRegistry;
  private arrowModule: ArrowModule | null = null;

  private constructor() {
    this.registry = DependencyRegistry.getInstance();
  }

  static getInstance(): ArrowLoader {
    if (!ArrowLoader.instance) {
      ArrowLoader.instance = new ArrowLoader();
    }
    return ArrowLoader.instance;
  }

  async loadArrow(): Promise<ArrowModule> {
    if (this.arrowModule) {
      return this.arrowModule;
    }

    try {
      const module = await this.registry.loadDependency(
        "apache-arrow",
        () => this.loadArrowModule(),
        {
          timeout: 15000,
          maxRetries: 3,
          retryDelay: 2000,
          required: true,
        }
      );

      this.arrowModule = module;
      return module;
    } catch (error) {
      const dataPrismError: DataPrismError = {
        message: `Failed to load Apache Arrow: ${error}`,
        code: "ARROW_LOAD_ERROR",
        source: "orchestration",
      };
      throw dataPrismError;
    }
  }

  private async loadArrowModule(): Promise<ArrowModule> {
    // Try multiple loading strategies based on the environment
    const loadStrategies = [
      () => this.loadFromGlobal(),
      () => this.loadFromImport(),
      () => this.loadFromCDN(),
      () => this.loadFromFallback(),
    ];

    let lastError: Error | null = null;

    for (const strategy of loadStrategies) {
      try {
        const module = await strategy();
        if (this.validateArrowModule(module)) {
          return module;
        }
      } catch (error) {
        lastError = error as Error;
        continue;
      }
    }

    throw new Error(
      `All Arrow loading strategies failed. Last error: ${lastError?.message}`
    );
  }

  private async loadFromGlobal(): Promise<ArrowModule> {
    // Check if Arrow is available globally (from externalized build)
    if (typeof window !== "undefined" && (window as any).Arrow) {
      return (window as any).Arrow;
    }
    throw new Error("Arrow not found in global scope");
  }

  private async loadFromImport(): Promise<ArrowModule> {
    // Try dynamic import
    try {
      const module = await import("apache-arrow");
      return module;
    } catch (error) {
      throw new Error(`Dynamic import failed: ${error}`);
    }
  }

  private async loadFromCDN(): Promise<ArrowModule> {
    // Load from CDN as fallback
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/apache-arrow@17.0.0/dist/Arrow.dom.min.js";
      script.onload = () => {
        if ((window as any).Arrow) {
          resolve((window as any).Arrow);
        } else {
          reject(new Error("Arrow not available after CDN load"));
        }
      };
      script.onerror = () => {
        reject(new Error("Failed to load Arrow from CDN"));
      };
      document.head.appendChild(script);
    });
  }

  private async loadFromFallback(): Promise<ArrowModule> {
    // Final fallback - try alternative CDN
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/apache-arrow@17.0.0/dist/Arrow.dom.min.js";
      script.onload = () => {
        if ((window as any).Arrow) {
          resolve((window as any).Arrow);
        } else {
          reject(new Error("Arrow not available after fallback CDN load"));
        }
      };
      script.onerror = () => {
        reject(new Error("Failed to load Arrow from fallback CDN"));
      };
      document.head.appendChild(script);
    });
  }

  private validateArrowModule(module: any): boolean {
    if (!module) return false;

    // Check for essential Arrow components
    const requiredComponents = [
      "Table",
      "RecordBatch", 
      "RecordBatchReader",
      "Schema",
      "Field",
      "Vector",
      "Type",
    ];

    return requiredComponents.every(component => 
      typeof module[component] !== "undefined"
    );
  }

  async waitForArrow(timeoutMs: number = 30000): Promise<ArrowModule> {
    try {
      return await this.registry.waitForDependency("apache-arrow", timeoutMs);
    } catch (error) {
      // If not already loaded, try to load it
      return await this.loadArrow();
    }
  }

  isArrowReady(): boolean {
    return this.registry.isDependencyReady("apache-arrow");
  }

  getArrowModule(): ArrowModule | null {
    return this.arrowModule;
  }

  async preloadArrow(): Promise<void> {
    if (!this.isArrowReady()) {
      await this.loadArrow();
    }
  }

  getArrowVersion(): string | undefined {
    if (this.arrowModule) {
      return this.arrowModule.version || "17.0.0";
    }
    return undefined;
  }

  createArrowError(message: string, originalError?: Error): DataPrismError {
    return {
      message: `Arrow Error: ${message}${originalError ? ` - ${originalError.message}` : ""}`,
      code: "ARROW_ERROR",
      source: "orchestration",
    };
  }

  async createRecordBatchReader(data: Uint8Array): Promise<any> {
    const arrow = await this.waitForArrow();
    
    try {
      return arrow.RecordBatchReader.from(data);
    } catch (error) {
      throw this.createArrowError(
        "Failed to create RecordBatchReader",
        error as Error
      );
    }
  }

  async createTable(data: any): Promise<any> {
    const arrow = await this.waitForArrow();
    
    try {
      return arrow.Table.from(data);
    } catch (error) {
      throw this.createArrowError(
        "Failed to create Arrow Table",
        error as Error
      );
    }
  }

  async validateArrowData(data: any): Promise<boolean> {
    try {
      await this.waitForArrow();
      // Basic validation - check if data can be processed by Arrow
      if (!data) return false;
      
      // Check for Arrow-compatible data structures
      if (data instanceof Uint8Array) return true;
      if (Array.isArray(data)) return true;
      if (data.constructor && data.constructor.name === "Table") return true;
      if (data.constructor && data.constructor.name === "RecordBatch") return true;
      
      return false;
    } catch (error) {
      return false;
    }
  }
}