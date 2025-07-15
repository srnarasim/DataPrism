# DataPrism Dependency Loading Guide

This guide explains how to use the enhanced dependency loading system introduced to address Apache Arrow timing issues and improve overall reliability.

## Overview

The new dependency loading system provides:
- **Dependency readiness checking** with `waitForReady()` methods
- **Event-based loading** with progress tracking
- **Enhanced error handling** with contextual messages and troubleshooting
- **Preloading APIs** for specific dependencies
- **Health monitoring** and diagnostics

## Quick Start

### Basic Usage

```typescript
import { DataPrismEngine } from '@dataprism/orchestration';

// Create engine with dependency configuration
const engine = new DataPrismEngine({
  dependencyConfig: {
    timeoutMs: 30000,
    maxRetries: 3,
    preloadDependencies: true,
    enableProgressEvents: true,
  }
});

// Wait for all dependencies to be ready
await engine.waitForReady();

// Now safe to use all features
const result = await engine.query('SELECT * FROM my_table');
```

### Waiting for Specific Dependencies

```typescript
// Wait for specific dependencies
await engine.waitForDuckDB();
await engine.waitForArrow();
await engine.waitForWasm();

// Or with custom timeout
await engine.waitForReady(['duckdb', 'apache-arrow'], 15000);
```

### Event-Based Loading

```typescript
import { DependencyEventSystem } from '@dataprism/orchestration';

const eventSystem = DependencyEventSystem.getInstance();

// Listen for dependency events
eventSystem.onDependencyLoading((event) => {
  console.log(`Loading ${event.dependency}...`);
});

eventSystem.onDependencyReady((event) => {
  console.log(`${event.dependency} is ready!`);
});

eventSystem.onArrowReady((event) => {
  console.log('Apache Arrow is ready for use');
});

eventSystem.onAllDependenciesReady((event) => {
  console.log(`All dependencies loaded in ${event.metadata.loadTime}ms`);
});
```

## Advanced Usage

### Preloading Dependencies

```typescript
// Preload specific dependencies
await engine.preloadDependencies(['apache-arrow', 'duckdb']);

// Or preload all dependencies
await engine.preloadDependencies();
```

### Error Handling

```typescript
import { DependencyErrorHandler } from '@dataprism/orchestration';

const errorHandler = DependencyErrorHandler.getInstance();

try {
  await engine.waitForArrow();
} catch (error) {
  if (error.code === 'APACHE-ARROW_TIMEOUT') {
    console.log('Arrow loading timed out');
    console.log('Troubleshooting steps:', error.troubleshooting);
  }
  
  // Get user-friendly error message
  const userMessage = errorHandler.createUserFriendlyMessage(error);
  console.log(userMessage);
}
```

### Dependency Health Monitoring

```typescript
// Check dependency status
const status = engine.getDependencyStatus();
console.log('DuckDB ready:', status.duckdb);
console.log('Arrow ready:', status.arrow);
console.log('WASM ready:', status.wasm);
console.log('Overall ready:', status.overall);

// Get health metrics
const health = engine.getDependencyHealth();
console.log(`Health score: ${health.healthScore}%`);
console.log(`Ready: ${health.readyCount}/${health.totalDependencies}`);
```

### Progress Tracking

```typescript
eventSystem.addEventListener('initializationProgress', (event) => {
  const { loaded, total, percentage } = event.progress;
  console.log(`Loading progress: ${percentage}% (${loaded}/${total})`);
});

// Create a loading indicator
const loadingIndicator = eventSystem.createLoadingIndicator(
  document.getElementById('loading-container'),
  {
    showProgress: true,
    showDetails: true,
    theme: 'dark',
  }
);

// Clean up when done
eventSystem.onAllDependenciesReady(() => {
  loadingIndicator.destroy();
});
```

## Specific Dependency Loaders

### Apache Arrow

```typescript
import { ArrowLoader } from '@dataprism/orchestration';

const arrowLoader = ArrowLoader.getInstance();

// Load Arrow with multiple fallback strategies
await arrowLoader.loadArrow();

// Check if Arrow is ready
if (arrowLoader.isArrowReady()) {
  const arrowModule = arrowLoader.getArrowModule();
  console.log('Arrow version:', arrowLoader.getArrowVersion());
}

// Use Arrow utilities
const isValidData = await arrowLoader.validateArrowData(myData);
const table = await arrowLoader.createTable(myData);
const reader = await arrowLoader.createRecordBatchReader(binaryData);
```

### Direct Registry Usage

```typescript
import { DependencyRegistry } from '@dataprism/orchestration';

const registry = DependencyRegistry.getInstance();

// Register a custom dependency
registry.registerDependency('my-custom-dep', {
  timeout: 10000,
  maxRetries: 2,
});

// Load with custom loader
await registry.loadDependency('my-custom-dep', async () => {
  const module = await import('my-custom-module');
  return module.default;
});

// Wait for it to be ready
await registry.waitForDependency('my-custom-dep');
```

## Configuration Options

### Engine Configuration

```typescript
const engine = new DataPrismEngine({
  dependencyConfig: {
    timeoutMs: 30000,        // Global timeout for dependencies
    maxRetries: 3,           // Max retry attempts
    retryDelay: 1000,        // Initial retry delay (exponential backoff)
    preloadDependencies: true,  // Preload dependencies during initialization
    enableProgressEvents: true, // Enable progress event emission
  }
});
```

### Dependency-Specific Options

```typescript
import { DependencyRegistry } from '@dataprism/orchestration';

const registry = DependencyRegistry.getInstance();

await registry.loadDependency('apache-arrow', loader, {
  timeout: 15000,    // Custom timeout for this dependency
  maxRetries: 4,     // More retries for Arrow (it's critical)
  retryDelay: 2000,  // Longer retry delay
  required: true,    // Mark as required dependency
  preload: true,     // Preload this dependency
});
```

## Error Handling Reference

### Common Error Codes

- `APACHE-ARROW_TIMEOUT`: Arrow loading timed out
- `APACHE-ARROW_NETWORK_ERROR`: Network issue loading Arrow
- `APACHE-ARROW_CORS_ERROR`: CORS issue with Arrow CDN
- `APACHE-ARROW_NOT_FOUND`: Arrow module not found
- `DUCKDB_LOAD_ERROR`: DuckDB initialization failed
- `WASM-CORE_IMPORT_ERROR`: WASM module import failed

### Error Properties

```typescript
interface EnhancedError {
  message: string;
  code: string;
  source: "orchestration";
  dependency?: string;
  retryCount?: number;
  troubleshooting?: string[];
  context?: {
    loadTime?: number;
    browserInfo?: string;
    networkStatus?: string;
    sharedArrayBufferSupport?: boolean;
  };
}
```

## Browser Compatibility

The dependency loading system handles various browser environments:

- **Chrome 90+**: Full support including SharedArrayBuffer
- **Firefox 88+**: Full support with proper COEP/COOP headers
- **Safari 14+**: Basic support, SharedArrayBuffer may be limited
- **Edge 90+**: Full support

### Feature Detection

```typescript
const status = engine.getDependencyStatus();

// Check browser capabilities
if (!status.wasm) {
  console.log('WebAssembly not supported in this browser');
}

const health = engine.getDependencyHealth();
if (health.healthScore < 80) {
  console.log('Some dependencies failed to load');
}
```

## Performance Optimization

### Parallel Loading

The system automatically loads dependencies in parallel for better performance:

```typescript
// This happens automatically during initialization
await engine.initialize(); // Loads DuckDB, Arrow, and WASM in parallel
```

### Preloading Strategy

```typescript
// Preload critical dependencies early
await engine.preloadDependencies(['apache-arrow', 'duckdb']);

// Then initialize the engine
await engine.initialize();
```

### Memory Management

```typescript
// Clean up when done
await engine.close(); // Automatically cleans up all dependencies
```

## Troubleshooting

### Common Issues

1. **Arrow RecordBatchReader undefined**
   ```typescript
   // Solution: Wait for Arrow to be ready
   await engine.waitForArrow();
   const reader = await arrowLoader.createRecordBatchReader(data);
   ```

2. **DuckDB timeout**
   ```typescript
   // Solution: Increase timeout and check network
   await engine.waitForDuckDB(60000); // 60 second timeout
   ```

3. **WASM loading fails**
   ```typescript
   // Solution: Check WebAssembly support
   if (typeof WebAssembly === 'undefined') {
     console.log('WebAssembly not supported');
   }
   ```

### Debug Information

```typescript
// Get comprehensive debug info
const health = engine.getDependencyHealth();
console.log('Dependency Health:', health);

const status = engine.getDependencyStatus();
console.log('Dependency Status:', status);

const allDeps = registry.getAllDependencies();
console.log('All Dependencies:', allDeps);
```

## Migration Guide

### From Old API

```typescript
// Old way (prone to timing issues)
const engine = new DataPrismEngine();
await engine.initialize();
const result = await engine.query('SELECT * FROM table');

// New way (reliable)
const engine = new DataPrismEngine();
await engine.waitForReady();
const result = await engine.query('SELECT * FROM table');
```

### Error Handling Migration

```typescript
// Old way
try {
  await engine.initialize();
} catch (error) {
  console.log('Initialization failed:', error.message);
}

// New way
try {
  await engine.waitForReady();
} catch (error) {
  console.log('Error code:', error.code);
  console.log('Troubleshooting:', error.troubleshooting);
  console.log('Context:', error.context);
}
```

This enhanced dependency loading system ensures reliable initialization and provides comprehensive tools for handling timing issues, especially with Apache Arrow and other external dependencies.