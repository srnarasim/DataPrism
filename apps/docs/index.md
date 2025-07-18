---
layout: home

hero:
  name: "DataPrism Core"
  text: "High-Performance Browser Analytics"
  tagline: "Process millions of rows with WebAssembly and DuckDB, all in your browser"
  image:
    src: /logo-large.svg
    alt: DataPrism Core
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View Examples
      link: /examples/
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: Demo Application
      link: https://srnarasim.github.io/DataPrism-demo-analytics/

features:
  - icon: 🚀
    title: WebAssembly Powered
    details: Near-native performance with WebAssembly runtime, processing millions of rows in milliseconds

  - icon: 🦆
    title: DuckDB Integration
    details: Columnar analytics engine optimized for OLAP workloads with full SQL support

  - icon: 🔌
    title: Plugin Architecture
    details: Extensible plugin system for custom data processors, visualizations, and integrations

  - icon: 🛡️
    title: Browser Native
    details: No server required - everything runs locally with full privacy and security

  - icon: 📊
    title: Rich Visualizations
    details: Built-in support for D3.js, Chart.js, and Observable Plot with interactive dashboards

  - icon: ⚡
    title: Performance First
    details: Intelligent caching, memory management, and query optimization for maximum efficiency
---

## Quick Start

Get up and running with DataPrism Core in under 2 minutes:

::: code-group

```bash [NPM]
npm install @dataprism/core
```

```bash [CDN]
# Include via CDN (no installation required)
<script type="module">
   import { DataPrismEngine } from 'https://srnarasim.github.io/DataPrism/dataprism.min.js';
</script>
```

```bash [CLI]
# Create new project with CLI
npx @dataprism/cli init my-analytics-app
cd my-analytics-app
npm run dev
```

:::

## Basic Usage

```typescript
import { DataPrismEngine } from "@dataprism/core";

// Initialize the engine
const engine = new DataPrismEngine();
await engine.initialize();

// Load CSV data
const csvData = `name,age,city
Alice,25,New York
Bob,30,London
Charlie,35,Tokyo`;

await engine.loadCSV(csvData, "users");

// Execute SQL queries
const result = await engine.query(`
  SELECT city, COUNT(*) as count, AVG(age) as avg_age
  FROM users 
  GROUP BY city
  ORDER BY count DESC
`);

console.log(result.data);
// [
//   { city: 'New York', count: 1, avg_age: 25 },
//   { city: 'London', count: 1, avg_age: 30 },
//   { city: 'Tokyo', count: 1, avg_age: 35 }
// ]
```

## Why DataPrism Core?

<div class="vp-feature-grid">
  <div class="vp-feature-item">
    <h3>🏆 Performance</h3>
    <p>Process 1M+ rows in <2 seconds with WebAssembly and columnar storage</p>
  </div>
  
  <div class="vp-feature-item">
    <h3>🔒 Privacy</h3>
    <p>All processing happens in your browser - your data never leaves your device</p>
  </div>
  
  <div class="vp-feature-item">
    <h3>🛠️ Developer Friendly</h3>
    <p>Full TypeScript support, comprehensive docs, and extensive examples</p>
  </div>
  
  <div class="vp-feature-item">
    <h3>🌐 Universal</h3>
    <p>Works in any modern browser with zero server dependencies</p>
  </div>
</div>

## Live Examples

Explore DataPrism Core capabilities:

- [**Basic Examples**](/DataPrism/examples/basic) - Simple data processing and visualization
- [**Advanced Examples**](/DataPrism/examples/advanced) - Complex analytical workloads
- [**Plugin Examples**](/DataPrism/examples/plugins) - Custom plugin development
- [**API Reference**](/DataPrism/api/) - Complete API documentation
- [**Demo Application**](https://srnarasim.github.io/DataPrism-demo-analytics/) - Interactive demo application

## Community & Support

<div class="community-links">
  <a href="https://github.com/dataprism/core" target="_blank">
    <img src="https://img.shields.io/github/stars/dataprism/core?style=social" alt="GitHub stars">
  </a>
  <a href="https://www.npmjs.com/package/@dataprism/core" target="_blank">
    <img src="https://img.shields.io/npm/dm/@dataprism/core" alt="NPM downloads">
  </a>
  <a href="https://github.com/dataprism/core/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  </a>
</div>

- 💬 [GitHub Discussions](https://github.com/srnarasim/DataPrism/discussions) - Ask questions and share ideas
- 🐛 [Issues](https://github.com/srnarasim/DataPrism/issues) - Report bugs and request features

## Browser Support

DataPrism Core supports all modern browsers with WebAssembly:

| Browser | Version | WebAssembly | Status             |
| ------- | ------- | ----------- | ------------------ |
| Chrome  | 90+     | ✅          | ✅ Fully Supported |
| Firefox | 88+     | ✅          | ✅ Fully Supported |
| Safari  | 14+     | ✅          | ✅ Fully Supported |
| Edge    | 90+     | ✅          | ✅ Fully Supported |

## What's Next?

<div class="next-steps">
  <div class="step">
    <h3>📚 Learn the Basics</h3>
    <p>Start with our <a href="/DataPrism/guide/getting-started">Getting Started guide</a> to understand core concepts</p>
  </div>
  
  <div class="step">
    <h3>🔧 Build Something</h3>
    <p>Follow our <a href="/DataPrism/examples/">examples</a> to build your first analytics application</p>
  </div>
  
  <div class="step">
    <h3>🚀 Go Advanced</h3>
    <p>Explore <a href="/DataPrism/plugins/">plugin development</a> and advanced integration patterns</p>
  </div>
</div>

<style>
.vp-feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.vp-feature-item {
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.vp-feature-item h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.vp-feature-item p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.5;
}

.community-links {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.community-links img {
  height: 20px;
}

.next-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.step {
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.step h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.step p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.step a {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
}

.step a:hover {
  text-decoration: underline;
}
</style>
