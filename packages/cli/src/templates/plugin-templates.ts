import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

export type PluginType = 'data-processor' | 'visualization' | 'integration' | 'utility';

export interface CreatePluginOptions {
  name: string;
  path: string;
  type: PluginType;
  typescript: boolean;
}

export async function createPlugin(options: CreatePluginOptions): Promise<void> {
  const { name, path: pluginPath, type, typescript } = options;

  // Create plugin directory
  await fs.ensureDir(pluginPath);

  // Create package.json
  const packageJson = createPluginPackageJson(name, type, typescript);
  await fs.writeJson(path.join(pluginPath, 'package.json'), packageJson, { spaces: 2 });

  // Create plugin structure
  await createPluginStructure(pluginPath, name, type, typescript);

  // Create configuration files
  await createPluginConfigFiles(pluginPath, typescript);

  logger.debug(`Created plugin ${name} with type ${type}`);
}

function createPluginPackageJson(name: string, type: PluginType, typescript: boolean) {
  const base = {
    name: `@dataprism/plugin-${name}`,
    version: '0.1.0',
    type: 'module',
    description: `DataPrism ${type} plugin: ${name}`,
    keywords: ['dataprism', 'plugin', type],
    main: typescript ? './dist/index.js' : './src/index.js',
    types: typescript ? './dist/index.d.ts' : undefined,
    exports: {
      '.': {
        import: typescript ? './dist/index.js' : './src/index.js',
        types: typescript ? './dist/index.d.ts' : undefined
      }
    },
    files: typescript ? ['dist/', 'README.md'] : ['src/', 'README.md'],
    scripts: {
      build: typescript ? 'tsc' : 'echo "No build step required for JavaScript"',
      'build:watch': typescript ? 'tsc --watch' : undefined,
      dev: 'npm run build:watch',
      test: 'vitest',
      'test:coverage': 'vitest --coverage',
      lint: typescript ? 'eslint src --ext .ts' : 'eslint src --ext .js',
      format: 'prettier --write src',
      clean: typescript ? 'rm -rf dist' : undefined,
      prepare: typescript ? 'npm run build' : undefined
    },
    dependencies: {
      '@dataprism/plugin-framework': '^1.0.0'
    },
    devDependencies: {
      vitest: '^1.0.0',
      '@vitest/coverage-v8': '^1.0.0',
      eslint: '^8.50.0',
      prettier: '^3.0.0'
    },
    peerDependencies: {
      '@dataprism/core': '^1.0.0'
    },
    engines: {
      node: '>=18.0.0'
    },
    dataprism: {
      plugin: {
        type,
        version: '1.0.0',
        entry: typescript ? './dist/index.js' : './src/index.js'
      }
    }
  };

  // Add type-specific dependencies
  if (type === 'visualization') {
    Object.assign(base.dependencies, {
      'd3': '^7.8.5',
      'chart.js': '^4.4.0'
    });
  }

  if (type === 'integration') {
    Object.assign(base.dependencies, {
      'node-fetch': '^3.3.2'
    });
  }

  // Add TypeScript dependencies
  if (typescript) {
    Object.assign(base.devDependencies, {
      typescript: '^5.2.0',
      '@types/node': '^20.0.0',
      '@typescript-eslint/eslint-plugin': '^6.0.0',
      '@typescript-eslint/parser': '^6.0.0'
    });

    if (type === 'visualization') {
      Object.assign(base.devDependencies, {
        '@types/d3': '^7.4.0'
      });
    }
  }

  // Remove undefined values
  base.scripts = Object.fromEntries(
    Object.entries(base.scripts).filter(([_, value]) => value !== undefined)
  );

  if (!typescript) {
    delete base.types;
    if (base.exports['.']) {
      delete base.exports['.'].types;
    }
  }

  return base;
}

async function createPluginStructure(pluginPath: string, name: string, type: PluginType, typescript: boolean): Promise<void> {
  const ext = typescript ? 'ts' : 'js';
  const srcDir = path.join(pluginPath, 'src');
  const testsDir = path.join(pluginPath, 'tests');

  await fs.ensureDir(srcDir);
  await fs.ensureDir(testsDir);

  // Create main plugin file
  const mainContent = createPluginMainFile(name, type, typescript);
  await fs.writeFile(path.join(srcDir, `index.${ext}`), mainContent);

  // Create test file
  const testContent = createPluginTestFile(name, type, typescript);
  await fs.writeFile(path.join(testsDir, `${name}.test.${ext}`), testContent);

  // Create type-specific additional files
  switch (type) {
    case 'data-processor':
      await createDataProcessorFiles(srcDir, typescript);
      break;
    case 'visualization':
      await createVisualizationFiles(srcDir, typescript);
      break;
    case 'integration':
      await createIntegrationFiles(srcDir, typescript);
      break;
    case 'utility':
      await createUtilityFiles(srcDir, typescript);
      break;
  }
}

function createPluginMainFile(name: string, type: PluginType, typescript: boolean): string {
  const className = toPascalCase(name);
  
  const imports = typescript ? `
import { PluginBase, PluginMetadata, DataPrismContext } from '@dataprism/plugin-framework';

interface ${className}Options {
  // Plugin-specific options
  debug?: boolean;
}

interface ${className}Result {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}
` : `
import { PluginBase } from '@dataprism/plugin-framework';
`;

  const classDefinition = typescript ? `
export class ${className}Plugin extends PluginBase {
  static metadata: PluginMetadata = {
    name: '${name}',
    version: '0.1.0',
    description: 'DataPrism ${type} plugin: ${name}',
    author: 'Your Name',
    type: '${type}',
    tags: ['${type}'],
    requiresContext: true
  };

  private options: ${className}Options;

  constructor(options: ${className}Options = {}) {
    super(${className}Plugin.metadata);
    this.options = { debug: false, ...options };
  }

  async initialize(context: DataPrismContext): Promise<void> {
    if (this.options.debug) {
      console.log('Initializing ${className}Plugin...');
    }
    // Plugin initialization logic here
  }

  async process(data: any, context: DataPrismContext): Promise<${className}Result> {
    try {
      if (this.options.debug) {
        console.log('Processing data with ${className}Plugin:', data);
      }

      // ${getTypeSpecificComment(type)}
      const result = await this.${getTypeSpecificMethod(type)}(data, context);

      return {
        success: true,
        data: result,
        metadata: {
          processedAt: new Date().toISOString(),
          inputSize: Array.isArray(data) ? data.length : 1
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          errorAt: new Date().toISOString()
        }
      };
    }
  }

  private async ${getTypeSpecificMethod(type)}(data: any, context: DataPrismContext): Promise<any> {
    ${getTypeSpecificImplementation(type, typescript)}
  }

  async cleanup(): Promise<void> {
    if (this.options.debug) {
      console.log('Cleaning up ${className}Plugin...');
    }
    // Plugin cleanup logic here
  }
}
` : `
export class ${className}Plugin extends PluginBase {
  static metadata = {
    name: '${name}',
    version: '0.1.0',
    description: 'DataPrism ${type} plugin: ${name}',
    author: 'Your Name',
    type: '${type}',
    tags: ['${type}'],
    requiresContext: true
  };

  constructor(options = {}) {
    super(${className}Plugin.metadata);
    this.options = { debug: false, ...options };
  }

  async initialize(context) {
    if (this.options.debug) {
      console.log('Initializing ${className}Plugin...');
    }
    // Plugin initialization logic here
  }

  async process(data, context) {
    try {
      if (this.options.debug) {
        console.log('Processing data with ${className}Plugin:', data);
      }

      // ${getTypeSpecificComment(type)}
      const result = await this.${getTypeSpecificMethod(type)}(data, context);

      return {
        success: true,
        data: result,
        metadata: {
          processedAt: new Date().toISOString(),
          inputSize: Array.isArray(data) ? data.length : 1
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        metadata: {
          errorAt: new Date().toISOString()
        }
      };
    }
  }

  async ${getTypeSpecificMethod(type)}(data, context) {
    ${getTypeSpecificImplementation(type, false)}
  }

  async cleanup() {
    if (this.options.debug) {
      console.log('Cleaning up ${className}Plugin...');
    }
    // Plugin cleanup logic here
  }
}
`;

  return `${imports}
${classDefinition}

// Export for DataPrism plugin system
export default ${className}Plugin;
`;
}

function createPluginTestFile(name: string, type: PluginType, typescript: boolean): string {
  const className = toPascalCase(name);
  const ext = typescript ? '' : '.js';
  
  return `
import { describe, it, expect, beforeEach } from 'vitest';
import { ${className}Plugin } from '../src/index${ext}';

describe('${className}Plugin', () => {
  let plugin${typescript ? `: ${className}Plugin` : ''};
  let mockContext${typescript ? ': any' : ''};

  beforeEach(() => {
    plugin = new ${className}Plugin({ debug: true });
    mockContext = {
      engine: {
        query: async (sql${typescript ? ': string' : ''}) => ({ data: [], metadata: {} })
      },
      logger: {
        info: console.log,
        error: console.error
      }
    };
  });

  it('should initialize correctly', async () => {
    await expect(plugin.initialize(mockContext)).resolves.not.toThrow();
  });

  it('should have correct metadata', () => {
    expect(${className}Plugin.metadata.name).toBe('${name}');
    expect(${className}Plugin.metadata.type).toBe('${type}');
  });

  it('should process data correctly', async () => {
    const testData = ${getTestData(type)};
    const result = await plugin.process(testData, mockContext);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.metadata.processedAt).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    // Mock an error scenario
    const invalidData = null;
    const result = await plugin.process(invalidData, mockContext);
    
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.metadata.errorAt).toBeDefined();
    }
  });

  it('should cleanup without errors', async () => {
    await expect(plugin.cleanup()).resolves.not.toThrow();
  });
});
`;
}

// Helper functions
function toPascalCase(str: string): string {
  return str.replace(/(?:^|[-_])(\w)/g, (_, char) => char.toUpperCase());
}

function getTypeSpecificComment(type: PluginType): string {
  switch (type) {
    case 'data-processor':
      return 'Transform and process the input data';
    case 'visualization':
      return 'Generate visualization from the data';
    case 'integration':
      return 'Integrate with external service';
    case 'utility':
      return 'Perform utility operation on the data';
    default:
      return 'Process the data';
  }
}

function getTypeSpecificMethod(type: PluginType): string {
  switch (type) {
    case 'data-processor':
      return 'transformData';
    case 'visualization':
      return 'generateVisualization';
    case 'integration':
      return 'integrateWithService';
    case 'utility':
      return 'performUtilityOperation';
    default:
      return 'processData';
  }
}

function getTypeSpecificImplementation(type: PluginType, typescript: boolean): string {
  switch (type) {
    case 'data-processor':
      return `
    // Example data transformation
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        processed: true,
        timestamp: new Date().toISOString()
      }));
    }
    
    return {
      ...data,
      processed: true,
      timestamp: new Date().toISOString()
    };`;

    case 'visualization':
      return `
    // Example visualization generation
    const chartConfig = {
      type: 'bar',
      data: {
        labels: Array.isArray(data) ? data.map((_, i) => \`Item \${i + 1}\`) : ['Single Item'],
        datasets: [{
          label: 'Data Values',
          data: Array.isArray(data) ? data.map(item => typeof item === 'object' ? Object.keys(item).length : 1) : [1],
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Generated by ${name} Plugin'
          }
        }
      }
    };
    
    return chartConfig;`;

    case 'integration':
      return `
    // Example external service integration
    // Note: Replace with actual service integration
    const response = await fetch('https://api.example.com/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(\`Integration failed: \${response.statusText}\`);
    }
    
    return await response.json();`;

    case 'utility':
      return `
    // Example utility operation
    if (Array.isArray(data)) {
      return {
        count: data.length,
        sample: data.slice(0, 5),
        summary: {
          types: [...new Set(data.map(item => typeof item))],
          hasObjects: data.some(item => typeof item === 'object'),
          hasNumbers: data.some(item => typeof item === 'number')
        }
      };
    }
    
    return {
      type: typeof data,
      value: data,
      size: JSON.stringify(data).length
    };`;

    default:
      return `
    // Default processing implementation
    return data;`;
  }
}

function getTestData(type: PluginType): string {
  switch (type) {
    case 'data-processor':
      return `[
      { name: 'John', age: 25, score: 85 },
      { name: 'Jane', age: 30, score: 92 }
    ]`;
    case 'visualization':
      return `[10, 20, 30, 40, 50]`;
    case 'integration':
      return `{ userId: 123, action: 'test' }`;
    case 'utility':
      return `['apple', 'banana', 'cherry']`;
    default:
      return `{ test: true }`;
  }
}

async function createDataProcessorFiles(srcDir: string, typescript: boolean): Promise<void> {
  // Additional files specific to data processors can be added here
}

async function createVisualizationFiles(srcDir: string, typescript: boolean): Promise<void> {
  // Additional files specific to visualizations can be added here
}

async function createIntegrationFiles(srcDir: string, typescript: boolean): Promise<void> {
  // Additional files specific to integrations can be added here
}

async function createUtilityFiles(srcDir: string, typescript: boolean): Promise<void> {
  // Additional files specific to utilities can be added here
}

async function createPluginConfigFiles(pluginPath: string, typescript: boolean): Promise<void> {
  // Create TypeScript config if needed
  if (typescript) {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020'],
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        declaration: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        skipLibCheck: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests']
    };

    await fs.writeJson(path.join(pluginPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
  }

  // Create README
  const readme = `# DataPrism Plugin

This is a DataPrism plugin created with the DataPrism CLI.

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev        # Watch mode
npm run build      # Build plugin
npm run test       # Run tests
npm run lint       # Lint code
\`\`\`

## Usage

\`\`\`${typescript ? 'typescript' : 'javascript'}
import { MyPlugin } from '@dataprism/plugin-my-plugin';

const plugin = new MyPlugin();
await plugin.initialize(context);
const result = await plugin.process(data, context);
\`\`\`

## Documentation

Visit [https://docs.dataprism.dev/plugins](https://docs.dataprism.dev/plugins) for plugin development documentation.
`;

  await fs.writeFile(path.join(pluginPath, 'README.md'), readme);
}