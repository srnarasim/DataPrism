#!/usr/bin/env node

/**
 * Simple HTTP server for serving DataPrism plugin examples
 * Fixes CORS issues when loading ES modules from file system
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const PORT = 3001;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.map': 'application/json',
  '.ts': 'application/javascript',
  '.tsx': 'application/javascript'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'text/plain';
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    const mimeType = getMimeType(filePath);
    
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle root request - serve the real workflow demo
  if (pathname === '/') {
    pathname = '/examples/real-workflow.html';
  }

  // Handle requests for examples directory
  if (pathname === '/examples') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DataPrism Plugin Examples</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .example { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          a { color: #2a5298; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>🚀 DataPrism Plugin Examples</h1>
        <div class="example">
          <h3><a href="/examples/real-workflow.html">Real Integration Demo</a></h3>
          <p>Complete workflow using actual DataPrism plugins - no mocking!</p>
        </div>
        <div class="example">
          <h3><a href="/examples/complete-workflow.html">Mock Demo (Original)</a></h3>
          <p>Original demo with simulated behavior for comparison</p>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Construct file path
  const filePath = path.join(__dirname, pathname);

  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    serveFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 DataPrism Plugin Examples Server running at:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Examples: http://localhost:${PORT}/examples`);
  console.log(`   Real Demo: http://localhost:${PORT}/examples/real-workflow.html`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Try a different port or stop the existing server.`);
  } else {
    console.error('❌ Server error:', err);
  }
});