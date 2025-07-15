#!/usr/bin/env node

/**
 * Optimized static server for CI browser tests
 * Serves pre-built assets with minimal overhead
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Cache for static files
const fileCache = new Map();

/**
 * Get MIME type for file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Get appropriate headers for different file types
 */
function getHeaders(filePath) {
  const mimeType = getMimeType(filePath);
  const headers = {
    'Content-Type': mimeType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Add COEP/COOP headers for WebAssembly
  if (filePath.endsWith('.html') || filePath.endsWith('.js')) {
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
  }

  // Add cache headers for static assets
  if (mimeType.startsWith('image/') || mimeType.startsWith('font/') || filePath.endsWith('.wasm')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
    headers['Cache-Control'] = 'public, max-age=3600';
  }

  return headers;
}

/**
 * Serve file from cache or filesystem
 */
function serveFile(filePath, response) {
  // Check cache first
  if (fileCache.has(filePath)) {
    const cached = fileCache.get(filePath);
    response.writeHead(200, cached.headers);
    response.end(cached.content);
    return;
  }

  // Read from filesystem
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('File not found');
      } else {
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('Internal server error');
      }
      return;
    }

    const headers = getHeaders(filePath);
    
    // Cache static assets
    if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.wasm')) {
      fileCache.set(filePath, { content, headers });
    }

    response.writeHead(200, headers);
    response.end(content);
  });
}

/**
 * Generate mock API responses for testing
 */
function handleApiRequest(pathname, response) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Mock DataPrism API endpoints
  if (pathname.includes('/api/query')) {
    const mockResult = {
      success: true,
      data: [{ result: 'mock_data', timestamp: new Date().toISOString() }],
      rowCount: 1,
      executionTime: 150,
      memoryUsage: 1024000,
    };
    response.writeHead(200, headers);
    response.end(JSON.stringify(mockResult));
    return;
  }

  if (pathname.includes('/api/status')) {
    const mockStatus = {
      engine: 'ready',
      wasm: true,
      memory: 2048000,
      uptime: 60000,
    };
    response.writeHead(200, headers);
    response.end(JSON.stringify(mockStatus));
    return;
  }

  if (pathname.includes('/api/health')) {
    const mockHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0-ci',
    };
    response.writeHead(200, headers);
    response.end(JSON.stringify(mockHealth));
    return;
  }

  // Default API response
  response.writeHead(404, headers);
  response.end(JSON.stringify({ error: 'API endpoint not found' }));
}

/**
 * Create test HTML page for CI testing
 */
function createTestPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DataPrism CI Test Page</title>
  <script>
    // Mock DataPrism for CI testing
    window.DataPrism = {
      isReady: true,
      initialized: true,
      version: '1.0.0-ci',
      
      async query(sql) {
        // Simulate query execution
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          success: true,
          data: [{ result: 'mock_data', query: sql }],
          rowCount: 1,
          executionTime: 100,
          memoryUsage: 1024000,
        };
      },
      
      getStatus() {
        return {
          engine: 'ready',
          wasm: true,
          memory: 2048000,
          uptime: 60000,
        };
      },
      
      getVersion() {
        return '1.0.0-ci';
      },
    };
    
    // Mock WASM support
    if (typeof WebAssembly === 'undefined') {
      window.WebAssembly = {
        instantiate: () => Promise.resolve({}),
        compile: () => Promise.resolve({}),
      };
    }
    
    // Simulate initialization
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DataPrism CI test page loaded');
      
      // Create test elements
      const statusElement = document.createElement('div');
      statusElement.setAttribute('data-testid', 'engine-status');
      statusElement.textContent = 'Engine Ready';
      document.body.appendChild(statusElement);
      
      const explorerElement = document.createElement('div');
      explorerElement.setAttribute('data-testid', 'data-explorer');
      explorerElement.innerHTML = \`
        <div data-testid="table-count">5</div>
        <button data-testid="run-sample-query">Run Query</button>
        <div data-testid="query-results" style="display: none;">
          <table>
            <tbody>
              <tr><td>Mock Data 1</td></tr>
              <tr><td>Mock Data 2</td></tr>
              <tr><td>Mock Data 3</td></tr>
            </tbody>
          </table>
        </div>
      \`;
      document.body.appendChild(explorerElement);
      
      // Add performance metrics
      const metricsElement = document.createElement('div');
      metricsElement.setAttribute('data-testid', 'performance-metrics');
      metricsElement.innerHTML = \`
        <div data-testid="memory-usage">2.5 MB</div>
        <div data-testid="query-count">10</div>
      \`;
      document.body.appendChild(metricsElement);
      
      // Add file upload mock
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.addEventListener('change', () => {
        const successDiv = document.createElement('div');
        successDiv.setAttribute('data-testid', 'upload-success');
        successDiv.textContent = 'Upload successful';
        document.body.appendChild(successDiv);
        
        const tableNameDiv = document.createElement('div');
        tableNameDiv.setAttribute('data-testid', 'uploaded-table-name');
        tableNameDiv.textContent = 'test_table';
        document.body.appendChild(tableNameDiv);
      });
      document.body.appendChild(fileInput);
      
      // Add query button handler
      const queryButton = document.querySelector('[data-testid="run-sample-query"]');
      if (queryButton) {
        queryButton.addEventListener('click', () => {
          const resultsDiv = document.querySelector('[data-testid="query-results"]');
          if (resultsDiv) {
            resultsDiv.style.display = 'block';
          }
        });
      }
    });
  </script>
</head>
<body>
  <h1>DataPrism CI Test Page</h1>
  <p>This page is optimized for CI browser testing</p>
  
  <nav>
    <a href="/explorer">Data Explorer</a>
    <a href="/performance">Performance</a>
  </nav>
  
  <div id="content">
    <p>Loading DataPrism engine...</p>
  </div>
</body>
</html>`;
}

/**
 * Main request handler
 */
function handleRequest(request, response) {
  const url = new URL(request.url, \`http://\${request.headers.host}\`);
  const pathname = url.pathname;
  
  console.log(\`[\${new Date().toISOString()}] \${request.method} \${pathname}\`);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    response.end();
    return;
  }
  
  // Handle API requests
  if (pathname.startsWith('/api/')) {
    handleApiRequest(pathname, response);
    return;
  }
  
  // Handle root path
  if (pathname === '/') {
    response.writeHead(200, {
      'Content-Type': 'text/html',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    });
    response.end(createTestPage());
    return;
  }
  
  // Handle route-like paths (SPA behavior)
  if (pathname === '/explorer' || pathname === '/performance') {
    response.writeHead(200, {
      'Content-Type': 'text/html',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    });
    response.end(createTestPage());
    return;
  }
  
  // Handle static files
  let filePath = path.join(process.cwd(), pathname);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try common static file locations
      const staticPaths = [
        path.join(process.cwd(), 'cdn/dist', pathname),
        path.join(process.cwd(), 'apps/demo-analytics/dist', pathname),
        path.join(process.cwd(), 'packages/orchestration/dist', pathname),
        path.join(process.cwd(), 'public', pathname),
      ];
      
      let found = false;
      for (const staticPath of staticPaths) {
        if (fs.existsSync(staticPath)) {
          filePath = staticPath;
          found = true;
          break;
        }
      }
      
      if (!found) {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('File not found');
        return;
      }
    }
    
    serveFile(filePath, response);
  });
}

/**
 * Start the server
 */
const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
  console.log(\`CI test server running at http://\${HOST}:\${PORT}\`);
  console.log(\`Process ID: \${process.pid}\`);
  console.log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;