import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DependencyRegistry } from '../dependency-registry.js';
import { ArrowLoader } from '../arrow-loader.js';
import { DependencyErrorHandler } from '../dependency-error-handler.js';
import { DependencyEventSystem } from '../dependency-events.js';
import { DataPrismEngine } from '../engine.js';

describe('DependencyRegistry', () => {
  let registry: DependencyRegistry;

  beforeEach(() => {
    registry = DependencyRegistry.getInstance();
    registry.clearAll();
  });

  afterEach(() => {
    registry.clearAll();
  });

  describe('dependency registration and loading', () => {
    it('should register a dependency', () => {
      const metadata = registry.registerDependency('test-dep', {
        timeout: 5000,
        maxRetries: 2,
      });

      expect(metadata.name).toBe('test-dep');
      expect(metadata.state).toBe('initializing');
      expect(metadata.maxRetries).toBe(2);
      expect(metadata.timeoutMs).toBe(5000);
    });

    it('should load a dependency successfully', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ version: '1.0.0' });
      
      const result = await registry.loadDependency('test-dep', mockLoader);
      
      expect(result).toEqual({ version: '1.0.0' });
      expect(registry.isDependencyReady('test-dep')).toBe(true);
    });

    it('should handle dependency loading failure', async () => {
      const mockLoader = vi.fn().mockRejectedValue(new Error('Load failed'));
      
      await expect(registry.loadDependency('test-dep', mockLoader, {
        maxRetries: 1,
      })).rejects.toThrow('Load failed');
      
      expect(registry.getDependencyState('test-dep')).toBe('error');
    });

    it('should retry failed dependency loading', async () => {
      const mockLoader = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue({ version: '1.0.0' });
      
      const result = await registry.loadDependency('test-dep', mockLoader, {
        maxRetries: 3,
        retryDelay: 100,
      });
      
      expect(result).toEqual({ version: '1.0.0' });
      expect(mockLoader).toHaveBeenCalledTimes(3);
    });

    it('should handle dependency timeout', async () => {
      const mockLoader = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );
      
      await expect(registry.loadDependency('test-dep', mockLoader, {
        timeout: 100,
      })).rejects.toThrow('failed to load within 100ms');
    });
  });

  describe('dependency waiting and status', () => {
    it('should wait for dependency to be ready', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ version: '1.0.0' });
      
      // Start loading
      const loadPromise = registry.loadDependency('test-dep', mockLoader);
      
      // Wait for it to be ready
      const result = await registry.waitForDependency('test-dep');
      
      expect(result).toEqual({ version: '1.0.0' });
      await loadPromise;
    });

    it('should wait for multiple dependencies', async () => {
      const mockLoader1 = vi.fn().mockResolvedValue({ name: 'dep1' });
      const mockLoader2 = vi.fn().mockResolvedValue({ name: 'dep2' });
      
      // Start loading both
      const load1 = registry.loadDependency('dep1', mockLoader1);
      const load2 = registry.loadDependency('dep2', mockLoader2);
      
      // Wait for both to be ready
      const results = await registry.waitForReady(['dep1', 'dep2']);
      
      expect(results).toEqual({
        dep1: { name: 'dep1' },
        dep2: { name: 'dep2' },
      });
      
      await Promise.all([load1, load2]);
    });

    it('should provide health status', () => {
      registry.registerDependency('dep1');
      registry.registerDependency('dep2');
      
      const health = registry.getHealthStatus();
      
      expect(health.totalDependencies).toBe(2);
      expect(health.readyCount).toBe(0);
      expect(health.healthScore).toBe(0);
    });
  });
});

describe('ArrowLoader', () => {
  let arrowLoader: ArrowLoader;
  let registry: DependencyRegistry;

  beforeEach(() => {
    arrowLoader = ArrowLoader.getInstance();
    registry = DependencyRegistry.getInstance();
    registry.clearAll();
  });

  afterEach(() => {
    registry.clearAll();
  });

  describe('Arrow module loading', () => {
    it('should validate Arrow module', () => {
      const mockArrowModule = {
        Table: {},
        RecordBatch: {},
        RecordBatchReader: {},
        Schema: {},
        Field: {},
        Vector: {},
        Type: {},
      };
      
      const isValid = (arrowLoader as any).validateArrowModule(mockArrowModule);
      expect(isValid).toBe(true);
    });

    it('should reject invalid Arrow module', () => {
      const mockArrowModule = {
        Table: {},
        // Missing required components
      };
      
      const isValid = (arrowLoader as any).validateArrowModule(mockArrowModule);
      expect(isValid).toBe(false);
    });

    it('should extract version from Arrow module', () => {
      const mockArrowModule = {
        version: '17.0.0',
        Table: {},
        RecordBatch: {},
        RecordBatchReader: {},
        Schema: {},
        Field: {},
        Vector: {},
        Type: {},
      };
      
      const version = (arrowLoader as any).extractVersion(mockArrowModule);
      expect(version).toBe('17.0.0');
    });

    it('should fallback to default version for Arrow module', () => {
      const mockArrowModule = {
        Table: {},
        RecordBatch: {},
        RecordBatchReader: {},
        Schema: {},
        Field: {},
        Vector: {},
        Type: {},
      };
      
      const version = (arrowLoader as any).extractVersion(mockArrowModule);
      expect(version).toBe('17.0.0');
    });
  });

  describe('Arrow data validation', () => {
    it('should validate Arrow-compatible data', async () => {
      const mockArrowModule = {
        Table: {},
        RecordBatch: {},
        RecordBatchReader: {},
        Schema: {},
        Field: {},
        Vector: {},
        Type: {},
      };
      
      // Mock the waitForArrow method to return immediately
      vi.spyOn(arrowLoader, 'waitForArrow').mockResolvedValue(mockArrowModule as any);
      
      const uint8Array = new Uint8Array([1, 2, 3]);
      const isValid = await arrowLoader.validateArrowData(uint8Array);
      expect(isValid).toBe(true);
      
      const arrayData = [1, 2, 3];
      const isValidArray = await arrowLoader.validateArrowData(arrayData);
      expect(isValidArray).toBe(true);
    });

    it('should reject invalid Arrow data', async () => {
      const mockArrowModule = {
        Table: {},
        RecordBatch: {},
        RecordBatchReader: {},
        Schema: {},
        Field: {},
        Vector: {},
        Type: {},
      };
      
      vi.spyOn(arrowLoader, 'waitForArrow').mockResolvedValue(mockArrowModule as any);
      
      const isValid = await arrowLoader.validateArrowData(null);
      expect(isValid).toBe(false);
    });
  });
});

describe('DependencyErrorHandler', () => {
  let errorHandler: DependencyErrorHandler;
  let registry: DependencyRegistry;

  beforeEach(() => {
    errorHandler = DependencyErrorHandler.getInstance();
    registry = DependencyRegistry.getInstance();
    registry.clearAll();
  });

  afterEach(() => {
    registry.clearAll();
  });

  describe('error creation and formatting', () => {
    it('should create dependency error with context', () => {
      const originalError = new Error('Load failed');
      const metadata = registry.registerDependency('test-dep');
      
      const error = errorHandler.createDependencyError('test-dep', originalError, metadata);
      
      expect(error.dependency).toBe('test-dep');
      expect(error.code).toBe('TEST-DEP_LOAD_ERROR');
      expect(error.troubleshooting).toBeDefined();
      expect(error.context).toBeDefined();
    });

    it('should format error for logging', () => {
      const originalError = new Error('Network timeout');
      const metadata = registry.registerDependency('apache-arrow');
      
      const error = errorHandler.createDependencyError('apache-arrow', originalError, metadata);
      const formatted = errorHandler.formatErrorForLogging(error);
      
      expect(formatted).toContain('APACHE-ARROW_LOAD_ERROR');
      expect(formatted).toContain('Context:');
      expect(formatted).toContain('Troubleshooting:');
    });

    it('should create user-friendly messages', () => {
      const originalError = new Error('Network timeout');
      const metadata = registry.registerDependency('apache-arrow');
      
      const error = errorHandler.createDependencyError('apache-arrow', originalError, metadata);
      const userMessage = errorHandler.createUserFriendlyMessage(error);
      
      expect(userMessage).toContain('apache-arrow');
      expect(userMessage).not.toContain('APACHE-ARROW_LOAD_ERROR');
    });
  });

  describe('retry strategy', () => {
    it('should create retry strategy for network errors', () => {
      const networkError = new Error('Network timeout');
      
      const strategy = errorHandler.createRetryStrategy('apache-arrow', networkError, 1);
      
      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.delay).toBeGreaterThan(0);
      expect(strategy.maxRetries).toBe(4);
    });

    it('should not retry CORS errors', () => {
      const corsError = new Error('CORS policy blocked');
      
      const strategy = errorHandler.createRetryStrategy('apache-arrow', corsError, 1);
      
      expect(strategy.shouldRetry).toBe(false);
    });

    it('should not retry browser support errors', () => {
      const supportError = new Error('SharedArrayBuffer not supported');
      
      const strategy = errorHandler.createRetryStrategy('duckdb', supportError, 1);
      
      expect(strategy.shouldRetry).toBe(false);
    });
  });
});

describe('DependencyEventSystem', () => {
  let eventSystem: DependencyEventSystem;
  let registry: DependencyRegistry;

  beforeEach(() => {
    eventSystem = DependencyEventSystem.getInstance();
    registry = DependencyRegistry.getInstance();
    registry.clearAll();
    eventSystem.clearAllEventHandlers();
  });

  afterEach(() => {
    registry.clearAll();
    eventSystem.clearAllEventHandlers();
  });

  describe('event emission and handling', () => {
    it('should emit dependency loading events', async () => {
      const loadingEvents: any[] = [];
      
      eventSystem.addEventListener('dependencyLoading', (event) => {
        loadingEvents.push(event);
      });
      
      const mockLoader = vi.fn().mockResolvedValue({ version: '1.0.0' });
      await registry.loadDependency('test-dep', mockLoader);
      
      expect(loadingEvents).toHaveLength(1);
      expect(loadingEvents[0].type).toBe('dependencyLoading');
      expect(loadingEvents[0].dependency).toBe('test-dep');
    });

    it('should emit dependency ready events', async () => {
      const readyEvents: any[] = [];
      
      eventSystem.addEventListener('dependencyReady', (event) => {
        readyEvents.push(event);
      });
      
      const mockLoader = vi.fn().mockResolvedValue({ version: '1.0.0' });
      await registry.loadDependency('test-dep', mockLoader);
      
      expect(readyEvents).toHaveLength(1);
      expect(readyEvents[0].type).toBe('dependencyReady');
      expect(readyEvents[0].dependency).toBe('test-dep');
    });

    it('should emit specific Arrow ready events', async () => {
      const arrowReadyEvents: any[] = [];
      
      eventSystem.addEventListener('arrowReady', (event) => {
        arrowReadyEvents.push(event);
      });
      
      const mockLoader = vi.fn().mockResolvedValue({ version: '17.0.0' });
      await registry.loadDependency('apache-arrow', mockLoader);
      
      expect(arrowReadyEvents).toHaveLength(1);
      expect(arrowReadyEvents[0].type).toBe('arrowReady');
      expect(arrowReadyEvents[0].dependency).toBe('apache-arrow');
    });

    it('should emit all dependencies ready event', async () => {
      const allReadyEvents: any[] = [];
      
      eventSystem.addEventListener('allDependenciesReady', (event) => {
        allReadyEvents.push(event);
      });
      
      const mockLoader1 = vi.fn().mockResolvedValue({ name: 'dep1' });
      const mockLoader2 = vi.fn().mockResolvedValue({ name: 'dep2' });
      
      await Promise.all([
        registry.loadDependency('dep1', mockLoader1),
        registry.loadDependency('dep2', mockLoader2),
      ]);
      
      expect(allReadyEvents).toHaveLength(1);
      expect(allReadyEvents[0].type).toBe('allDependenciesReady');
      expect(allReadyEvents[0].progress.percentage).toBe(100);
    });
  });

  describe('convenience methods', () => {
    it('should wait for Arrow ready event', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ version: '17.0.0' });
      
      // Start loading Arrow
      const loadPromise = registry.loadDependency('apache-arrow', mockLoader);
      
      // Wait for Arrow ready event
      const waitPromise = eventSystem.waitForArrowReady();
      
      await Promise.all([loadPromise, waitPromise]);
      
      expect(mockLoader).toHaveBeenCalled();
    });

    it('should wait for all dependencies ready event', async () => {
      const mockLoader1 = vi.fn().mockResolvedValue({ name: 'dep1' });
      const mockLoader2 = vi.fn().mockResolvedValue({ name: 'dep2' });
      
      // Start loading dependencies
      const loadPromises = [
        registry.loadDependency('dep1', mockLoader1),
        registry.loadDependency('dep2', mockLoader2),
      ];
      
      // Wait for all dependencies ready event
      const waitPromise = eventSystem.waitForAllDependenciesReady();
      
      await Promise.all([...loadPromises, waitPromise]);
      
      expect(mockLoader1).toHaveBeenCalled();
      expect(mockLoader2).toHaveBeenCalled();
    });
  });
});

describe('DataPrismEngine Integration', () => {
  let engine: DataPrismEngine;

  beforeEach(() => {
    engine = new DataPrismEngine();
  });

  afterEach(async () => {
    await engine.close();
  });

  describe('dependency integration', () => {
    it('should have dependency status methods', () => {
      expect(engine.getDependencyStatus).toBeDefined();
      expect(engine.getDependencyHealth).toBeDefined();
      expect(engine.waitForReady).toBeDefined();
      expect(engine.waitForArrow).toBeDefined();
      expect(engine.waitForDuckDB).toBeDefined();
    });

    it('should include dependency info in status', () => {
      const status = engine.getStatus();
      
      expect(status.dependencies).toBeDefined();
      expect(status.dependencyHealth).toBeDefined();
      expect(status.dependencies).toHaveProperty('duckdb');
      expect(status.dependencies).toHaveProperty('arrow');
      expect(status.dependencies).toHaveProperty('wasm');
      expect(status.dependencies).toHaveProperty('overall');
    });

    it('should provide preloading functionality', () => {
      expect(engine.preloadDependencies).toBeDefined();
      expect(typeof engine.preloadDependencies).toBe('function');
    });
  });
});