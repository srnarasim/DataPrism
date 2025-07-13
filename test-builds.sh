#!/bin/bash

# Quick Build Test Script - Tests just the main build steps that were failing

echo "🔨 Quick Build Test"
echo "=================="

# Test the main build commands in order
echo "1. Testing build:all..."
npm run build:all

echo ""
echo "2. Testing build:cdn..."
npm run build:cdn

echo ""
echo "3. Testing generate:api..."
npm run generate:api

echo ""
echo "4. Testing validate:packages..."
npm run validate:packages

echo ""
echo "✅ All builds completed successfully!"
echo ""
echo "Generated artifacts:"
echo "  - Core WASM: packages/core/pkg/"
echo "  - CDN bundle: cdn/dist/dataprism.min.js ($(du -h cdn/dist/dataprism.min.js | cut -f1))"
echo "  - Demo app: apps/demo-analytics/dist/"
echo "  - Docs: apps/docs/.vitepress/dist/"
echo "  - API docs: docs/api/"