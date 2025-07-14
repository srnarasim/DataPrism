/**
 * External Services Mock for DataPrism CI/CD Robustness
 * Provides comprehensive mocking for external dependencies to ensure stable testing
 */

import { vi } from 'vitest';

export interface MockConfig {
  llmProviders: boolean;
  cdnRequests: boolean;
  networkRequests: boolean;
  wasmModules: boolean;
  localStorage: boolean;
  performance: boolean;
}

export interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface MockedResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<any>;
  text: () => Promise<string>;
  arrayBuffer: () => Promise<ArrayBuffer>;
  blob: () => Promise<Blob>;
  headers: Record<string, string>;
}

export class ExternalServiceMock {
  private static instance: ExternalServiceMock;
  private originalFetch: typeof global.fetch;
  private mockConfig: MockConfig;
  private requestLog: Array<{ url: string; method: string; timestamp: number }> = [];

  constructor(config: Partial<MockConfig> = {}) {
    this.mockConfig = {
      llmProviders: true,
      cdnRequests: true,
      networkRequests: true,
      wasmModules: true,
      localStorage: true,
      performance: true,
      ...config
    };
    
    this.originalFetch = global.fetch;
  }

  static getInstance(config?: Partial<MockConfig>): ExternalServiceMock {
    if (!ExternalServiceMock.instance) {
      ExternalServiceMock.instance = new ExternalServiceMock(config);
    }
    return ExternalServiceMock.instance;
  }

  /**
   * Set up all mocks based on configuration
   */
  setupMocks(): void {
    console.log('🔧 Setting up external service mocks...');
    
    if (this.mockConfig.networkRequests) {
      this.mockNetworkRequests();
    }
    
    if (this.mockConfig.llmProviders) {
      this.mockLLMProviders();
    }
    
    if (this.mockConfig.cdnRequests) {
      this.mockCDNRequests();
    }
    
    if (this.mockConfig.wasmModules) {
      this.mockWASMModules();
    }
    
    if (this.mockConfig.localStorage) {
      this.mockLocalStorage();
    }
    
    if (this.mockConfig.performance) {
      this.mockPerformanceAPI();
    }
    
    console.log('✅ External service mocks configured');
  }

  /**
   * Clean up all mocks and restore original implementations
   */
  cleanup(): void {
    console.log('🧹 Cleaning up external service mocks...');
    
    // Restore original fetch
    global.fetch = this.originalFetch;
    
    // Clear all vi mocks
    vi.clearAllMocks();
    vi.restoreAllMocks();
    
    // Clear request log
    this.requestLog = [];
    
    console.log('✅ External service mocks cleaned up');
  }

  /**
   * Get request log for debugging
   */
  getRequestLog(): Array<{ url: string; method: string; timestamp: number }> {
    return [...this.requestLog];
  }

  /**
   * Mock network requests with intelligent responses
   */
  private mockNetworkRequests(): void {
    global.fetch = vi.fn().mockImplementation(async (url: string | Request, init?: RequestInit) => {
      const urlString = typeof url === 'string' ? url : url.url;
      const method = init?.method || 'GET';
      
      // Log request
      this.requestLog.push({
        url: urlString,
        method,
        timestamp: Date.now()
      });
      
      console.log(`🌐 Mocked fetch request: ${method} ${urlString}`);
      
      // Route to specific mock handlers
      if (this.isLLMRequest(urlString)) {
        return this.handleLLMRequest(urlString, init);
      }
      
      if (this.isCDNRequest(urlString)) {
        return this.handleCDNRequest(urlString);
      }
      
      if (this.isWASMRequest(urlString)) {
        return this.handleWASMRequest(urlString);
      }
      
      // Default successful response
      return this.createMockResponse({
        ok: true,
        status: 200,
        statusText: 'OK',
        data: { success: true, message: 'Mocked response' }
      });
    });
  }

  /**
   * Mock LLM provider APIs
   */
  private mockLLMProviders(): void {
    // The network mock will handle LLM requests, but we can add specific logic here
    console.log('🤖 LLM provider mocks configured');
  }

  /**
   * Mock CDN requests
   */
  private mockCDNRequests(): void {
    console.log('🌍 CDN request mocks configured');
  }

  /**
   * Mock WASM module loading
   */
  private mockWASMModules(): void {
    // Mock WebAssembly global if not available (e.g., in Node.js tests)
    if (typeof WebAssembly === 'undefined') {
      (global as any).WebAssembly = {
        compile: vi.fn().mockResolvedValue({}),
        instantiate: vi.fn().mockResolvedValue({
          instance: {
            exports: {
              memory: new ArrayBuffer(1024),
              __wbindgen_malloc: vi.fn().mockReturnValue(0),
              __wbindgen_free: vi.fn(),
              test_function: vi.fn().mockReturnValue(42)
            }
          },
          module: {}
        }),
        validate: vi.fn().mockReturnValue(true),
        Module: vi.fn(),
        Instance: vi.fn(),
        Memory: vi.fn(),
        Table: vi.fn(),
        CompileError: Error,
        RuntimeError: Error,
        LinkError: Error
      };
    }
    
    console.log('🦀 WASM module mocks configured');
  }

  /**
   * Mock localStorage for tests
   */
  private mockLocalStorage(): void {
    const localStorageMock = {
      getItem: vi.fn().mockImplementation((key: string) => {
        return localStorageMock.store[key] || null;
      }),
      setItem: vi.fn().mockImplementation((key: string, value: string) => {
        localStorageMock.store[key] = value;
      }),
      removeItem: vi.fn().mockImplementation((key: string) => {
        delete localStorageMock.store[key];
      }),
      clear: vi.fn().mockImplementation(() => {
        localStorageMock.store = {};
      }),
      store: {} as Record<string, string>
    };
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    console.log('💾 localStorage mocks configured');
  }

  /**
   * Mock Performance API
   */
  private mockPerformanceAPI(): void {
    const performanceMock = {
      now: vi.fn().mockImplementation(() => Date.now()),
      measure: vi.fn(),
      mark: vi.fn(),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
      getEntriesByName: vi.fn().mockReturnValue([]),
      getEntriesByType: vi.fn().mockReturnValue([]),
      memory: {
        usedJSHeapSize: 10 * 1024 * 1024, // 10MB
        totalJSHeapSize: 50 * 1024 * 1024, // 50MB
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
      }
    };
    
    Object.defineProperty(global, 'performance', {
      value: performanceMock,
      writable: true
    });
    
    console.log('⚡ Performance API mocks configured');
  }

  /**
   * Check if URL is an LLM provider request
   */
  private isLLMRequest(url: string): boolean {
    const llmDomains = [
      'api.openai.com',
      'api.anthropic.com',
      'api.cohere.ai',
      'api.huggingface.co',
      'bedrock.amazonaws.com'
    ];
    
    return llmDomains.some(domain => url.includes(domain));
  }

  /**
   * Check if URL is a CDN request
   */
  private isCDNRequest(url: string): boolean {
    const cdnPatterns = [
      'cdn.jsdelivr.net',
      'unpkg.com',
      'cdnjs.cloudflare.com',
      'github.io',
      'gitcdn.xyz'
    ];
    
    return cdnPatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Check if URL is a WASM request
   */
  private isWASMRequest(url: string): boolean {
    return url.endsWith('.wasm') || url.includes('wasm');
  }

  /**
   * Handle LLM provider requests
   */
  private async handleLLMRequest(url: string, init?: RequestInit): Promise<MockedResponse> {
    // Simulate different response times
    await this.simulateNetworkDelay(200, 800);
    
    const llmResponse: LLMResponse = {
      choices: [{
        message: {
          content: 'This is a mocked LLM response for testing purposes.',
          role: 'assistant'
        }
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 15,
        total_tokens: 25
      }
    };
    
    return this.createMockResponse({
      ok: true,
      status: 200,
      statusText: 'OK',
      data: llmResponse
    });
  }

  /**
   * Handle CDN requests
   */
  private async handleCDNRequest(url: string): Promise<MockedResponse> {
    // Simulate CDN response times
    await this.simulateNetworkDelay(50, 300);
    
    if (url.endsWith('.js')) {
      return this.createMockResponse({
        ok: true,
        status: 200,
        statusText: 'OK',
        data: '// Mocked JavaScript module\nexport default { version: "1.0.0-mock" };',
        headers: { 'content-type': 'application/javascript' }
      });
    }
    
    if (url.endsWith('.json')) {
      return this.createMockResponse({
        ok: true,
        status: 200,
        statusText: 'OK',
        data: { version: '1.0.0-mock', source: 'cdn-mock' }
      });
    }
    
    return this.createMockResponse({
      ok: true,
      status: 200,
      statusText: 'OK',
      data: 'Mocked CDN content'
    });
  }

  /**
   * Handle WASM requests
   */
  private async handleWASMRequest(url: string): Promise<MockedResponse> {
    // Simulate WASM loading time
    await this.simulateNetworkDelay(100, 500);
    
    // Create a minimal valid WASM binary
    const wasmBinary = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, // WASM magic number
      0x01, 0x00, 0x00, 0x00  // WASM version
    ]);
    
    return this.createMockResponse({
      ok: true,
      status: 200,
      statusText: 'OK',
      data: wasmBinary,
      headers: { 'content-type': 'application/wasm' }
    });
  }

  /**
   * Create a mock response object
   */
  private createMockResponse(options: {
    ok: boolean;
    status: number;
    statusText: string;
    data: any;
    headers?: Record<string, string>;
  }): MockedResponse {
    const { ok, status, statusText, data, headers = {} } = options;
    
    return {
      ok,
      status,
      statusText,
      headers,
      json: vi.fn().mockResolvedValue(data),
      text: vi.fn().mockResolvedValue(typeof data === 'string' ? data : JSON.stringify(data)),
      arrayBuffer: vi.fn().mockResolvedValue(
        data instanceof ArrayBuffer ? data : new ArrayBuffer(1024)
      ),
      blob: vi.fn().mockResolvedValue(new Blob([JSON.stringify(data)]))
    };
  }

  /**
   * Simulate network delay
   */
  private async simulateNetworkDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Convenience function to set up mocks for testing
 */
export function setupExternalServiceMocks(config?: Partial<MockConfig>): ExternalServiceMock {
  const mockService = ExternalServiceMock.getInstance(config);
  mockService.setupMocks();
  return mockService;
}

/**
 * Convenience function to clean up mocks after testing
 */
export function cleanupExternalServiceMocks(): void {
  const mockService = ExternalServiceMock.getInstance();
  mockService.cleanup();
}

/**
 * Mock setup for specific test scenarios
 */
export const MockScenarios = {
  /**
   * Set up mocks for browser testing
   */
  browser: () => setupExternalServiceMocks({
    llmProviders: true,
    cdnRequests: true,
    networkRequests: true,
    wasmModules: true,
    localStorage: true,
    performance: true
  }),

  /**
   * Set up mocks for unit testing
   */
  unit: () => setupExternalServiceMocks({
    llmProviders: true,
    cdnRequests: false,
    networkRequests: true,
    wasmModules: true,
    localStorage: true,
    performance: true
  }),

  /**
   * Set up mocks for integration testing
   */
  integration: () => setupExternalServiceMocks({
    llmProviders: true,
    cdnRequests: true,
    networkRequests: true,
    wasmModules: false, // Use real WASM in integration tests
    localStorage: true,
    performance: true
  }),

  /**
   * Set up minimal mocks for performance testing
   */
  performance: () => setupExternalServiceMocks({
    llmProviders: false,
    cdnRequests: false,
    networkRequests: false,
    wasmModules: false,
    localStorage: false,
    performance: false // Use real performance API for accurate measurements
  })
};