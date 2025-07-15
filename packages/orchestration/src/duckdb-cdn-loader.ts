/**
 * DuckDB CDN Loader - Handles loading DuckDB from CDN or fallback to JSDelivr
 */
import * as duckdb from "@duckdb/duckdb-wasm";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

export interface DuckDBBundle {
  mainModule: string;
  mainWorker: string;
  pthreadWorker?: string;
}

export interface DuckDBConfig {
  baseUrl: string;
  assets: Record<string, string>;
  bundles: Record<string, DuckDBBundle>;
}

export class DuckDBCDNLoader {
  private config: DuckDBConfig | null = null;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || this.detectCDNBaseUrl();
  }

  /**
   * Detect the CDN base URL from the current script location
   */
  private detectCDNBaseUrl(): string {
    if (typeof window === 'undefined') return '';
    
    // Try to detect from current script tag
    const scripts = Array.from(document.getElementsByTagName('script'));
    const currentScript = scripts.find(script => 
      script.src && script.src.includes('dataprism')
    );
    
    if (currentScript) {
      const url = new URL(currentScript.src);
      return `${url.protocol}//${url.host}${url.pathname.replace(/\/[^\/]*$/, '')}`;
    }
    
    return '';
  }

  /**
   * Load DuckDB configuration from CDN
   */
  private async loadConfig(): Promise<DuckDBConfig> {
    if (this.config) return this.config;

    try {
      const configUrl = `${this.baseUrl}/duckdb-config.json`;
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to load DuckDB config: ${response.status}`);
      }
      
      this.config = await response.json();
      return this.config;
    } catch (error) {
      console.warn('Failed to load DuckDB config from CDN, using fallback');
      throw error;
    }
  }

  /**
   * Get DuckDB bundles from CDN or fallback to JSDelivr
   */
  async getBundles(): Promise<any> {
    try {
      // Try to load from CDN first
      const config = await this.loadConfig();
      
      // Convert CDN config to DuckDB bundle format
      const bundles = Object.entries(config.bundles).map(([name, bundle]) => ({
        name,
        mainModule: `${this.baseUrl}/${bundle.mainModule}`,
        mainWorker: `${this.baseUrl}/${bundle.mainWorker}`,
        pthreadWorker: bundle.pthreadWorker ? `${this.baseUrl}/${bundle.pthreadWorker}` : undefined
      }));

      return bundles;
    } catch (error) {
      // Fallback to JSDelivr
      console.log('Using JSDelivr fallback for DuckDB');
      
      return duckdb.getJsDelivrBundles();
    }
  }

  /**
   * Select the best bundle for the current environment
   */
  async selectBundle(bundles: any[]): Promise<any> {
    try {
      // If we have CDN bundles, select based on browser capabilities
      if (Array.isArray(bundles) && bundles.length > 0) {
        // Check for SharedArrayBuffer support (for COI bundle)
        if (typeof SharedArrayBuffer !== 'undefined' && bundles.find(b => b.name === 'coi')) {
          return bundles.find(b => b.name === 'coi');
        }
        
        // Check for exception handling support
        if (bundles.find(b => b.name === 'eh')) {
          return bundles.find(b => b.name === 'eh');
        }
        
        // Fallback to MVP
        return bundles.find(b => b.name === 'mvp') || bundles[0];
      }
      
      // If using JSDelivr bundles, use their selection logic
      return await duckdb.selectBundle(bundles);
    } catch (error) {
      console.error('Bundle selection failed:', error);
      throw error;
    }
  }


  /**
   * Create DuckDB instance with proper bundle loading
   */
  async createDuckDB(): Promise<AsyncDuckDB> {
    const bundles = await this.getBundles();
    const bundle = await this.selectBundle(bundles);
    
    // Create worker URL
    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      })
    );

    const worker = new Worker(worker_url);
    
    // Create DuckDB instance
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);

    // Initialize with the selected bundle
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    
    return db;
  }
}