/**
 * Simple static server for browser tests when demo app is not available
 * Serves basic HTML with DataPrism core for testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const createTestHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DataPrism Browser Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
        .loading { background-color: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <h1>DataPrism Browser Test Environment</h1>
    <div id="status" class="status loading">Initializing DataPrism...</div>
    <div id="results"></div>
    
    <script type="module">
        // Mock DataPrism for testing
        window.DataPrism = {
            initialized: false,
            isReady: false,
            
            async initialize() {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        this.initialized = true;
                        this.isReady = true;
                        document.getElementById('status').textContent = 'DataPrism initialized successfully';
                        document.getElementById('status').className = 'status success';
                        resolve();
                    }, 500); // Reduced from 1000ms to 500ms for faster tests
                });
            },
            
            async query(sql) {
                if (!this.initialized) {
                    throw new Error('DataPrism not initialized');
                }
                
                // Mock query response
                return {
                    data: [{ result: 'mock_data', query: sql }],
                    rowCount: 1,
                    executionTime: 50
                };
            },
            
            getVersion() {
                return '1.0.0-test';
            },
            
            version: '1.0.0-test'
        };
        
        // Auto-initialize for tests
        window.addEventListener('load', async () => {
            try {
                await window.DataPrism.initialize();
                console.log('DataPrism test environment ready');
            } catch (error) {
                console.error('Failed to initialize DataPrism:', error);
                document.getElementById('status').textContent = 'Failed to initialize DataPrism: ' + error.message;
                document.getElementById('status').className = 'status error';
            }
        });
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    const url = req.url === '/' ? '/index.html' : req.url;
    
    if (url === '/index.html') {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        });
        res.end(createTestHTML());
    } else if (url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', server: 'static-test-server' }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Static test server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down static test server...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Shutting down static test server...');
    server.close(() => {
        process.exit(0);
    });
});