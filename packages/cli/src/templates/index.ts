import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

export type ProjectTemplate = 'analytics-dashboard' | 'data-processor' | 'plugin-starter';

export interface CreateProjectOptions {
  name: string;
  path: string;
  template: ProjectTemplate;
  typescript: boolean;
}

export async function createProject(options: CreateProjectOptions): Promise<void> {
  const { name, path: projectPath, template, typescript } = options;

  // Create project directory
  await fs.ensureDir(projectPath);

  // Create package.json
  const packageJson = createPackageJson(name, template, typescript);
  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create basic project structure
  await createProjectStructure(projectPath, template, typescript);

  // Create configuration files
  await createConfigFiles(projectPath, typescript);

  logger.debug(`Created project ${name} with template ${template}`);
}

function createPackageJson(name: string, template: ProjectTemplate, typescript: boolean) {
  const base = {
    name,
    version: '0.1.0',
    type: 'module',
    description: getTemplateDescription(template),
    keywords: ['dataprism', 'analytics', 'webassembly'],
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      test: 'vitest',
      lint: typescript ? 'eslint src --ext .ts,.tsx' : 'eslint src --ext .js,.jsx',
      'type-check': typescript ? 'tsc --noEmit' : undefined
    },
    dependencies: {
      '@dataprism/core': '^1.0.0',
      '@dataprism/orchestration': '^1.0.0'
    },
    devDependencies: {
      vite: '^5.0.0',
      vitest: '^1.0.0',
      '@vitest/ui': '^1.0.0',
      eslint: '^8.50.0'
    }
  };

  // Add template-specific dependencies
  if (template === 'analytics-dashboard') {
    Object.assign(base.dependencies, {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'd3': '^7.8.5',
      'chart.js': '^4.4.0',
      'react-chartjs-2': '^5.2.0'
    });
    Object.assign(base.devDependencies, {
      '@vitejs/plugin-react': '^4.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@types/d3': '^7.4.0'
    });
  }

  if (template === 'plugin-starter') {
    Object.assign(base.dependencies, {
      '@dataprism/plugin-framework': '^1.0.0'
    });
  }

  // Add TypeScript dependencies
  if (typescript) {
    Object.assign(base.devDependencies, {
      typescript: '^5.2.0',
      '@typescript-eslint/eslint-plugin': '^6.0.0',
      '@typescript-eslint/parser': '^6.0.0'
    });
  }

  // Remove undefined values
  base.scripts = Object.fromEntries(
    Object.entries(base.scripts).filter(([_, value]) => value !== undefined)
  );

  return base;
}

function getTemplateDescription(template: ProjectTemplate): string {
  switch (template) {
    case 'analytics-dashboard':
      return 'DataPrism analytics dashboard application';
    case 'data-processor':
      return 'DataPrism data processing application';
    case 'plugin-starter':
      return 'DataPrism plugin development starter';
    default:
      return 'DataPrism application';
  }
}

async function createProjectStructure(projectPath: string, template: ProjectTemplate, typescript: boolean): Promise<void> {
  const ext = typescript ? 'ts' : 'js';
  const reactExt = typescript ? 'tsx' : 'jsx';

  // Create basic directories
  await fs.ensureDir(path.join(projectPath, 'src'));
  await fs.ensureDir(path.join(projectPath, 'public'));

  // Create template-specific files
  switch (template) {
    case 'analytics-dashboard':
      await createAnalyticsDashboard(projectPath, typescript);
      break;
    case 'data-processor':
      await createDataProcessor(projectPath, typescript);
      break;
    case 'plugin-starter':
      await createPluginStarter(projectPath, typescript);
      break;
  }

  // Create basic HTML file
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DataPrism App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.${reactExt}"></script>
</body>
</html>`;

  await fs.writeFile(path.join(projectPath, 'public', 'index.html'), indexHtml);
}

async function createAnalyticsDashboard(projectPath: string, typescript: boolean): Promise<void> {
  const ext = typescript ? 'tsx' : 'jsx';
  
  const mainFile = typescript ? `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
` : `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  const appFile = `
import React, { useEffect, useState } from 'react';
import { DataPrismEngine } from '@dataprism/core';
import './App.css';

${typescript ? `
interface QueryResult {
  data: any[];
  executionTime: number;
}
` : ''}

function App() {
  const [engine, setEngine] = useState${typescript ? '<DataPrismEngine | null>' : ''}(null);
  const [results, setResults] = useState${typescript ? '<QueryResult | null>' : ''}(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeEngine() {
      try {
        const engineInstance = new DataPrismEngine();
        await engineInstance.initialize();
        setEngine(engineInstance);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize DataPrism engine:', error);
        setLoading(false);
      }
    }

    initializeEngine();
  }, []);

  const runQuery = async () => {
    if (!engine) return;
    
    setLoading(true);
    try {
      const result = await engine.query('SELECT 1 as hello, 2 as world');
      setResults(result);
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>DataPrism Analytics Dashboard</h1>
        {loading ? (
          <p>Loading DataPrism engine...</p>
        ) : (
          <div>
            <button onClick={runQuery}>Run Sample Query</button>
            {results && (
              <div>
                <h3>Query Results:</h3>
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
`;

  await fs.writeFile(path.join(projectPath, 'src', `main.${ext}`), mainFile);
  await fs.writeFile(path.join(projectPath, 'src', `App.${ext}`), appFile);

  // Create CSS files
  const indexCss = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, monospace;
}
`;

  const appCss = `
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

button {
  background-color: #61dafb;
  border: none;
  padding: 10px 20px;
  margin: 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #21b8d4;
}

pre {
  text-align: left;
  background-color: #f4f4f4;
  color: #333;
  padding: 15px;
  border-radius: 5px;
  max-width: 600px;
  overflow-x: auto;
}
`;

  await fs.writeFile(path.join(projectPath, 'src', 'index.css'), indexCss);
  await fs.writeFile(path.join(projectPath, 'src', 'App.css'), appCss);
}

async function createDataProcessor(projectPath: string, typescript: boolean): Promise<void> {
  const ext = typescript ? 'ts' : 'js';
  
  const mainFile = `
import { DataPrismEngine } from '@dataprism/core';

${typescript ? `
interface ProcessorOptions {
  batchSize?: number;
  parallel?: boolean;
}
` : ''}

class DataProcessor {
  private engine${typescript ? ': DataPrismEngine' : ''};
  
  constructor() {
    this.engine = new DataPrismEngine();
  }

  async initialize()${typescript ? ': Promise<void>' : ''} {
    await this.engine.initialize();
    console.log('DataPrism engine initialized');
  }

  async processCSV(data${typescript ? ': string' : ''}, options${typescript ? ': ProcessorOptions = {}' : ' = {}'}) {
    const { batchSize = 1000, parallel = false } = options;
    
    try {
      // Load CSV data into DuckDB
      const result = await this.engine.query(\`
        SELECT * FROM read_csv_auto('data:text/csv,\${encodeURIComponent(data)}')
        LIMIT \${batchSize}
      \`);
      
      console.log('Processed CSV data:', result);
      return result;
    } catch (error) {
      console.error('Failed to process CSV:', error);
      throw error;
    }
  }

  async aggregateData(tableName${typescript ? ': string' : ''}, groupBy${typescript ? ': string[]' : ''}, metrics${typescript ? ': string[]' : ''}) {
    const groupByClause = groupBy.join(', ');
    const metricsClause = metrics.map(metric => \`SUM(\${metric}) as total_\${metric}\`).join(', ');
    
    const query = \`
      SELECT \${groupByClause}, \${metricsClause}
      FROM \${tableName}
      GROUP BY \${groupByClause}
      ORDER BY \${groupByClause}
    \`;
    
    return await this.engine.query(query);
  }
}

// Example usage
async function main() {
  const processor = new DataProcessor();
  await processor.initialize();
  
  // Example CSV data
  const csvData = \`name,age,score
John,25,85
Jane,30,92
Bob,28,78
Alice,32,95\`;

  try {
    const results = await processor.processCSV(csvData);
    console.log('Processing complete:', results);
    
    // Example aggregation
    const aggregated = await processor.aggregateData('csv_data', ['age'], ['score']);
    console.log('Aggregated results:', aggregated);
  } catch (error) {
    console.error('Processing failed:', error);
  }
}

main().catch(console.error);
`;

  await fs.writeFile(path.join(projectPath, 'src', `main.${ext}`), mainFile);
}

async function createPluginStarter(projectPath: string, typescript: boolean): Promise<void> {
  const ext = typescript ? 'ts' : 'js';
  
  const mainFile = `
import { PluginBase, PluginMetadata } from '@dataprism/plugin-framework';

${typescript ? `
interface MyPluginOptions {
  option1?: string;
  option2?: number;
}

interface MyPluginResult {
  success: boolean;
  data?: any;
  error?: string;
}
` : ''}

export class MyPlugin extends PluginBase {
  static metadata${typescript ? ': PluginMetadata' : ''} = {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'A sample DataPrism plugin',
    author: 'Your Name',
    type: 'data-processor'
  };

  constructor(options${typescript ? ': MyPluginOptions = {}' : ' = {}'}) {
    super(MyPlugin.metadata);
    this.options = options;
  }

  async initialize()${typescript ? ': Promise<void>' : ''} {
    console.log('Initializing MyPlugin...');
    // Plugin initialization logic here
  }

  async process(data${typescript ? ': any' : ''})${typescript ? ': Promise<MyPluginResult>' : ''} {
    try {
      // Plugin processing logic here
      console.log('Processing data with MyPlugin:', data);
      
      // Example transformation
      const processedData = Array.isArray(data) 
        ? data.map(item => ({ ...item, processed: true }))
        : { ...data, processed: true };
      
      return {
        success: true,
        data: processedData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async cleanup()${typescript ? ': Promise<void>' : ''} {
    console.log('Cleaning up MyPlugin...');
    // Plugin cleanup logic here
  }
}

// Export for DataPrism plugin system
export default MyPlugin;
`;

  await fs.writeFile(path.join(projectPath, 'src', `main.${ext}`), mainFile);

  // Create plugin test file
  const testFile = `
import { describe, it, expect, beforeEach } from 'vitest';
import { MyPlugin } from '../src/main${typescript ? '' : '.js'}';

describe('MyPlugin', () => {
  let plugin${typescript ? ': MyPlugin' : ''};

  beforeEach(() => {
    plugin = new MyPlugin();
  });

  it('should initialize correctly', async () => {
    await expect(plugin.initialize()).resolves.not.toThrow();
  });

  it('should process data correctly', async () => {
    const testData = { name: 'test', value: 123 };
    const result = await plugin.process(testData);
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ ...testData, processed: true });
  });

  it('should handle arrays', async () => {
    const testData = [
      { name: 'item1', value: 1 },
      { name: 'item2', value: 2 }
    ];
    
    const result = await plugin.process(testData);
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ ...testData[0], processed: true });
  });
});
`;

  await fs.ensureDir(path.join(projectPath, 'tests'));
  await fs.writeFile(path.join(projectPath, 'tests', `plugin.test.${ext}`), testFile);
}

async function createConfigFiles(projectPath: string, typescript: boolean): Promise<void> {
  // Create Vite config
  const viteConfig = typescript ? `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@dataprism/core']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
});
` : `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@dataprism/core']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
});
`;

  await fs.writeFile(path.join(projectPath, `vite.config.${typescript ? 'ts' : 'js'}`), viteConfig);

  // Create TypeScript config if needed
  if (typescript) {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }]
    };

    await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });

    const tsNodeConfig = {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true
      },
      include: ['vite.config.ts']
    };

    await fs.writeJson(path.join(projectPath, 'tsconfig.node.json'), tsNodeConfig, { spaces: 2 });
  }

  // Create README
  const readme = `# DataPrism Project

This project was created with the DataPrism CLI.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run test\` - Run tests
- \`npm run lint\` - Lint code

## Documentation

Visit [https://docs.dataprism.dev](https://docs.dataprism.dev) for complete documentation.
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}