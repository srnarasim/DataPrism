# DataPrism Plugin Examples Demo

## Quick Start

To run the real integration demo that uses actual DataPrism plugins:

```bash
# Build the browser bundle and start the demo server
npm run demo

# Or run individually:
npm run build:browser  # Creates dist/browser.js with all dependencies bundled
npm run serve
```

Then open your browser to:
- **Main Demo**: http://localhost:3001/examples/real-workflow.html
- **Examples List**: http://localhost:3001/examples
- **Original Mock Demo**: http://localhost:3001/examples/complete-workflow.html

> **Note**: Default port is 3001. If you see port conflicts, edit `server.js` to change the PORT value.

## Demo Features

### Real Integration Demo (`real-workflow.html`)
✅ **Uses actual DataPrism plugins - no mocking!**

- **CSV Import**: Real file parsing with PapaParse integration
- **Clustering Analysis**: Actual ML algorithms (K-Means, DBSCAN)
- **Data Visualization**: Real D3.js charts with Observable Charts plugin
- **Performance Monitoring**: Live metrics collection
- **Export Functions**: Real plugin export methods for PNG/SVG/CSV/JSON

### Original Mock Demo (`complete-workflow.html`)
⚠️ **For comparison - uses simulated behavior**

- Shows the same UI but with setTimeout delays and random data generation

## Troubleshooting

### CORS Errors
If you see "Cross-Origin Request Blocked" errors, it means you're trying to open the HTML files directly in the browser instead of through the HTTP server. Always use:

```bash
npm run serve
```

Then access via `http://localhost:3000` instead of opening files directly.

### Port 3000 Already in Use
If port 3000 is busy, modify `server.js` to use a different port:

```javascript
const PORT = 3001; // Change this line
```

### Build Issues
Make sure all dependencies are installed and use the browser build:

```bash
npm install
npm run build:browser  # Use browser build, not regular build
```

### Module Resolution Errors
If you see "bare specifier" errors like `The specifier "d3" was a bare specifier`, it means:

1. You're using the wrong build - use `npm run build:browser` instead of `npm run build`
2. The browser bundle at `dist/browser.js` includes all dependencies bundled together
3. The regular `dist/index.js` build externalizes dependencies for library use

### Worker Loading Errors
If you see "disallowed MIME type", "importScripts inside Module Worker", or "NetworkError" errors:

1. Make sure you're running the HTTP server (`npm run serve`), not opening files directly
2. The server automatically serves worker files with correct `application/javascript` MIME type
3. Workers are automatically copied to `/workers/` directory during build process
4. Workers are now self-contained with no external CDN dependencies

### Network/CDN Errors
The current implementation eliminates CDN dependency issues by using built-in algorithms:
- No more `NS_ERROR_CORRUPTED_CONTENT` from unpkg.com
- No network timeouts or CDN availability issues
- Faster and more reliable operation

### Self-Contained Workers
The workers are now **self-contained** with no external dependencies:
- **CSV Parser**: Built-in CSV parsing algorithm (no PapaParse CDN dependency)
- **Clustering**: Built-in K-Means and DBSCAN implementations (no ML library CDN dependencies)
- **Reliability**: No network dependencies or CDN failures
- **Performance**: Faster loading and execution without external script loading

## Plugin Architecture

The demo showcases four plugin categories:

1. **Integration Plugin**: `CSVImporterPlugin` - Real CSV file parsing
2. **Visualization Plugin**: `ObservableChartsPlugin` - D3.js chart rendering  
3. **Processing Plugin**: `SemanticClusteringPlugin` - ML clustering algorithms
4. **Utility Plugin**: `PerformanceMonitorPlugin` - System metrics collection

Each plugin follows the DataPrism plugin interface and runs in a controlled context with proper lifecycle management.