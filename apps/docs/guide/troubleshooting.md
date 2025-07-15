# Troubleshooting

Common issues and solutions for DataPrism implementations.

## Common Issues

### Installation Problems

#### WebAssembly Not Supported

**Error**: `WebAssembly is not supported in this browser`

**Solution**:
```javascript
// Check WebAssembly support
if (!('WebAssembly' in window)) {
    throw new Error('WebAssembly not supported. Please use a modern browser.');
}

// Fallback for older browsers
const engine = new DataPrismEngine({
    fallback: {
        mode: 'javascript',
        wasmPath: '/fallback/dataprism-js.min.js'
    }
});
```

#### CDN Loading Issues

**Error**: `Failed to load DataPrism from CDN`

**Solution**:
```javascript
// Use multiple CDN sources
const cdnSources = [
    'https://srnarasim.github.io/DataPrism/dataprism.min.js',
    'https://cdn.jsdelivr.net/npm/@dataprism/core@latest/dist/dataprism.min.js',
    'https://unpkg.com/@dataprism/core@latest/dist/dataprism.min.js'
];

async function loadDataPrism() {
    for (const src of cdnSources) {
        try {
            const { DataPrismEngine } = await import(src);
            return DataPrismEngine;
        } catch (error) {
            console.warn(`Failed to load from ${src}:`, error);
        }
    }
    throw new Error('Failed to load DataPrism from any CDN');
}
```

### Memory Issues

#### Out of Memory Errors

**Error**: `RangeError: Maximum call stack size exceeded` or `Out of memory`

**Solution**:
```javascript
// Configure memory limits
const engine = new DataPrismEngine({
    memory: {
        limit: '2GB',
        gcThreshold: 0.8,
        autoCleanup: true
    }
});

// Process large datasets in chunks
async function processLargeDataset(data) {
    const chunkSize = 10000;
    const results = [];
    
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const result = await engine.processChunk(chunk);
        results.push(result);
        
        // Clean up after each chunk
        if (i % 50000 === 0) {
            await engine.clearCache();
        }
    }
    
    return results;
}
```

#### Memory Leaks

**Error**: Gradually increasing memory usage

**Solution**:
```javascript
// Monitor memory usage
const memoryMonitor = setInterval(async () => {
    const stats = await engine.getMemoryStats();
    console.log(`Memory usage: ${stats.used}MB`);
    
    if (stats.used > 1000) { // 1GB
        await engine.clearCache();
        await engine.compactMemory();
    }
}, 30000); // Check every 30 seconds

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    clearInterval(memoryMonitor);
    engine.destroy();
});
```

### Query Problems

#### SQL Syntax Errors

**Error**: `SQL syntax error near 'SELECT'`

**Solution**:
```javascript
// Validate SQL before execution
function validateSQL(sql) {
    const forbidden = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER'];
    const upperSQL = sql.toUpperCase();
    
    for (const keyword of forbidden) {
        if (upperSQL.includes(keyword)) {
            throw new Error(`SQL operation '${keyword}' is not allowed`);
        }
    }
}

// Use query builder for complex queries
const query = engine.queryBuilder()
    .select(['name', 'email', 'age'])
    .from('users')
    .where('age', '>', 18)
    .orderBy('name')
    .limit(100)
    .build();
```

#### Query Timeout

**Error**: `Query timeout after 30 seconds`

**Solution**:
```javascript
// Increase timeout for complex queries
const result = await engine.query(sql, params, {
    timeout: 60000 // 60 seconds
});

// Optimize query performance
await engine.createIndex('table_name', ['column1', 'column2']);

// Use query optimization
const optimizedQuery = await engine.optimizeQuery(sql);
const result = await engine.query(optimizedQuery);
```

### Performance Issues

#### Slow Query Execution

**Problem**: Queries taking too long to execute

**Solution**:
```javascript
// Analyze query performance
const analysis = await engine.analyzeQuery(`
    SELECT customer_id, SUM(amount) as total
    FROM orders
    WHERE order_date >= '2024-01-01'
    GROUP BY customer_id
`);

console.log('Query plan:', analysis.executionPlan);
console.log('Estimated cost:', analysis.cost);
console.log('Suggestions:', analysis.optimizations);

// Implement suggestions
if (analysis.missingIndexes.length > 0) {
    for (const index of analysis.missingIndexes) {
        await engine.createIndex(index.table, index.columns);
    }
}
```

#### Large Dataset Loading

**Problem**: Loading large datasets causes browser freeze

**Solution**:
```javascript
// Use streaming for large files
const stream = await engine.createReadStream('/large-file.csv');
let rowCount = 0;

stream.on('data', (chunk) => {
    rowCount += chunk.length;
    console.log(`Processed ${rowCount} rows`);
});

stream.on('end', () => {
    console.log(`Finished processing ${rowCount} rows`);
});

// Or use web workers
const worker = new Worker('/data-processor-worker.js');
worker.postMessage({ file: '/large-file.csv' });
worker.onmessage = (event) => {
    console.log('Processing progress:', event.data.progress);
};
```

### Plugin Issues

#### Plugin Loading Failures

**Error**: `Failed to load plugin 'visualization-plugin'`

**Solution**:
```javascript
// Check plugin dependencies
const pluginManager = new DataPrismPluginManager({
    debug: true
});

try {
    const plugin = await pluginManager.loadPlugin('visualization-plugin', {
        timeout: 30000,
        retries: 3
    });
} catch (error) {
    console.error('Plugin loading error:', error);
    
    // Try alternative plugin
    const fallbackPlugin = await pluginManager.loadPlugin('basic-charts');
}
```

#### Plugin Compatibility Issues

**Error**: `Plugin API version mismatch`

**Solution**:
```javascript
// Check plugin compatibility
const pluginInfo = await pluginManager.getPluginInfo('chart-plugin');
console.log('Plugin version:', pluginInfo.version);
console.log('Required API version:', pluginInfo.apiVersion);

// Use compatible version
const compatiblePlugin = await pluginManager.loadPlugin('chart-plugin', {
    version: '1.2.0'
});
```

### Network Issues

#### CORS Errors

**Error**: `Access to fetch at 'https://api.example.com' from origin 'https://mysite.com' has been blocked by CORS policy`

**Solution**:
```javascript
// Configure CORS proxy
const engine = new DataPrismEngine({
    network: {
        corsProxy: 'https://cors-proxy.example.com/',
        allowedOrigins: ['https://mysite.com']
    }
});

// Or use server-side proxy
const proxyUrl = '/api/proxy?url=' + encodeURIComponent('https://api.example.com/data');
const data = await engine.loadFromURL(proxyUrl);
```

#### API Rate Limiting

**Error**: `Rate limit exceeded: 429 Too Many Requests`

**Solution**:
```javascript
// Implement exponential backoff
async function makeRequestWithBackoff(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fetch(url);
        } catch (error) {
            if (error.status === 429) {
                const delay = Math.pow(2, i) * 1000; // Exponential backoff
                console.log(`Rate limited, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded');
}
```

### Browser Compatibility

#### Safari WebAssembly Issues

**Problem**: WebAssembly features not working in Safari

**Solution**:
```javascript
// Check Safari-specific features
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isSafari) {
    // Use Safari-compatible configuration
    const engine = new DataPrismEngine({
        wasm: {
            enableSIMD: false, // SIMD not fully supported in older Safari
            enableThreads: false, // SharedArrayBuffer restrictions
            fallbackMode: 'optimized-js'
        }
    });
}
```

#### Mobile Browser Issues

**Problem**: Performance issues on mobile devices

**Solution**:
```javascript
// Detect mobile devices
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    const engine = new DataPrismEngine({
        memory: {
            limit: '512MB', // Lower memory limit for mobile
            gcThreshold: 0.6 // More aggressive garbage collection
        },
        workers: {
            count: 1, // Fewer workers on mobile
            maxMemoryPerWorker: '128MB'
        },
        performance: {
            reducedPrecision: true,
            lowPowerMode: true
        }
    });
}
```

## Debugging Tools

### Debug Mode

```javascript
// Enable debug mode
const engine = new DataPrismEngine({
    debug: true,
    verbose: true,
    logLevel: 'debug'
});

// Access debug information
const debugInfo = await engine.getDebugInfo();
console.log('Engine state:', debugInfo.state);
console.log('Memory usage:', debugInfo.memory);
console.log('Active queries:', debugInfo.queries);
```

### Error Reporting

```javascript
// Set up error reporting
engine.onError((error) => {
    console.error('DataPrism error:', error);
    
    // Send error to monitoring service
    fetch('/api/errors', {
        method: 'POST',
        body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        })
    });
});
```

### Performance Monitoring

```javascript
// Monitor performance
const monitor = engine.createPerformanceMonitor();

monitor.on('slow-query', (query) => {
    console.warn(`Slow query detected: ${query.sql}`);
    console.warn(`Execution time: ${query.duration}ms`);
});

monitor.on('memory-warning', (stats) => {
    console.warn(`High memory usage: ${stats.percentage}%`);
});
```

## Support Resources

### Getting Help

1. **GitHub Issues**: [Report bugs and request features](https://github.com/srnarasim/DataPrism/issues)
2. **Discussions**: [Community support](https://github.com/srnarasim/DataPrism/discussions)
3. **Documentation**: [Complete documentation](/guide/)
4. **Examples**: [Code examples](/examples/)

### Reporting Issues

When reporting issues, please include:

- DataPrism version
- Browser and version
- Operating system
- Error messages
- Minimal reproduction code
- Expected vs actual behavior

### Contributing

- [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md)
- [Code of Conduct](https://github.com/srnarasim/DataPrism/blob/main/CODE_OF_CONDUCT.md)
- [Development Setup](/guide/development)

## Next Steps

- [Performance Optimization](/guide/performance)
- [Security Best Practices](/guide/security)
- [API Reference](/api/)
- [Plugin Development](/plugins/development)