/**
 * Plugin Manifest Generator
 * Generates comprehensive plugin manifests for CDN deployment
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname, resolve } from 'path';
import { createHash } from 'crypto';
import type { PluginManifest, PluginMetadata, PluginCategory } from './plugin-loader.js';

export interface PluginDiscoveryOptions {
  pluginDirs: string[];
  baseUrl: string;
  outputPath: string;
  includeDevPlugins?: boolean;
  validatePlugins?: boolean;
  generateIntegrity?: boolean;
  categories?: PluginCategoryConfig[];
}

export interface PluginCategoryConfig {
  id: string;
  name: string;
  description: string;
  patterns: string[];
}

export interface DiscoveredPlugin {
  id: string;
  name: string;
  version: string;
  entry: string;
  dependencies: string[];
  metadata: PluginMetadata;
  integrity: string;
  category: string;
  exports: string[];
  filePath: string;
  packageJson?: any;
}

export class PluginManifestGenerator {
  private options: Required<PluginDiscoveryOptions>;
  private discoveredPlugins: DiscoveredPlugin[] = [];

  constructor(options: PluginDiscoveryOptions) {
    this.options = {
      includeDevPlugins: false,
      validatePlugins: true,
      generateIntegrity: true,
      categories: [],
      ...options,
    };
  }

  /**
   * Generate a complete plugin manifest
   */
  async generateManifest(): Promise<PluginManifest> {
    console.log('🔍 Discovering plugins...');
    
    // Discover plugins in all specified directories
    for (const pluginDir of this.options.pluginDirs) {
      await this.discoverPluginsInDirectory(pluginDir);
    }

    console.log(`📦 Found ${this.discoveredPlugins.length} plugins`);

    // Validate plugins if requested
    if (this.options.validatePlugins) {
      await this.validateDiscoveredPlugins();
    }

    // Generate categories
    const categories = this.generateCategories();

    // Create manifest
    const manifest: PluginManifest = {
      plugins: this.discoveredPlugins.map(plugin => ({
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        entry: plugin.entry,
        dependencies: plugin.dependencies,
        metadata: plugin.metadata,
        integrity: plugin.integrity,
        category: plugin.category,
        exports: plugin.exports,
      })),
      categories,
      compatibility: {
        chrome: '90+',
        firefox: '88+',
        safari: '14+',
        edge: '90+',
        webAssembly: true,
        es2020: true,
      },
      baseUrl: this.options.baseUrl,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };

    // Write manifest to file
    await this.writeManifest(manifest);

    console.log(`✅ Generated plugin manifest with ${manifest.plugins.length} plugins`);
    this.printManifestSummary(manifest);

    return manifest;
  }

  /**
   * Discover plugins in a specific directory
   */
  private async discoverPluginsInDirectory(pluginDir: string): Promise<void> {
    if (!existsSync(pluginDir)) {
      console.warn(`⚠️  Plugin directory not found: ${pluginDir}`);
      return;
    }

    console.log(`🔍 Scanning plugin directory: ${pluginDir}`);

    const entries = readdirSync(pluginDir);

    for (const entry of entries) {
      const entryPath = join(pluginDir, entry);
      const stats = statSync(entryPath);

      if (stats.isDirectory()) {
        // Check if this is a plugin directory
        await this.processPluginDirectory(entryPath);
      } else if (stats.isFile() && this.isPluginFile(entry)) {
        // Individual plugin file
        await this.processPluginFile(entryPath);
      }
    }
  }

  /**
   * Process a plugin directory (with package.json)
   */
  private async processPluginDirectory(pluginPath: string): Promise<void> {
    const packageJsonPath = join(pluginPath, 'package.json');
    
    if (!existsSync(packageJsonPath)) {
      // Not a proper plugin directory, check for plugin files
      await this.discoverPluginsInDirectory(pluginPath);
      return;
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      // Skip non-DataPrism plugins
      if (!this.isDataPrismPlugin(packageJson)) {
        return;
      }

      // Skip dev plugins if not included
      if (!this.options.includeDevPlugins && this.isDevPlugin(packageJson)) {
        return;
      }

      const plugin = await this.createPluginFromPackage(pluginPath, packageJson);
      if (plugin) {
        this.discoveredPlugins.push(plugin);
        console.log(`  ✅ Discovered plugin: ${plugin.name} (${plugin.id})`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to process plugin directory ${pluginPath}:`, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Process an individual plugin file
   */
  private async processPluginFile(filePath: string): Promise<void> {
    try {
      const plugin = await this.createPluginFromFile(filePath);
      if (plugin) {
        this.discoveredPlugins.push(plugin);
        console.log(`  ✅ Discovered plugin file: ${plugin.name} (${plugin.id})`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to process plugin file ${filePath}:`, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Create plugin entry from package.json
   */
  private async createPluginFromPackage(pluginPath: string, packageJson: any): Promise<DiscoveredPlugin | null> {
    const pluginId = this.generatePluginId(packageJson.name);
    const entryFile = this.findEntryFile(pluginPath, packageJson);
    
    if (!entryFile) {
      console.warn(`⚠️  No entry file found for plugin: ${packageJson.name}`);
      return null;
    }

    const relativePath = this.getRelativePath(entryFile);
    const integrity = this.options.generateIntegrity ? await this.generateIntegrity(entryFile) : '';
    
    return {
      id: pluginId,
      name: packageJson.name,
      version: packageJson.version || '1.0.0',
      entry: relativePath,
      dependencies: this.extractDependencies(packageJson),
      metadata: this.extractMetadata(packageJson, entryFile),
      integrity,
      category: this.categorizePlugin(packageJson),
      exports: await this.extractExports(entryFile),
      filePath: entryFile,
      packageJson,
    };
  }

  /**
   * Create plugin entry from individual file
   */
  private async createPluginFromFile(filePath: string): Promise<DiscoveredPlugin | null> {
    const fileName = basename(filePath, extname(filePath));
    const pluginId = this.generatePluginId(fileName);
    const relativePath = this.getRelativePath(filePath);
    
    // Try to extract metadata from file comments
    const fileContent = readFileSync(filePath, 'utf8');
    const metadata = this.extractMetadataFromComments(fileContent, filePath);
    const integrity = this.options.generateIntegrity ? await this.generateIntegrity(filePath) : '';

    return {
      id: pluginId,
      name: metadata.name || fileName,
      version: metadata.version || '1.0.0',
      entry: relativePath,
      dependencies: metadata.dependencies || [],
      metadata: {
        description: metadata.description || 'DataPrism plugin',
        author: metadata.author || 'Unknown',
        license: metadata.license || 'MIT',
        keywords: metadata.keywords || [],
        size: statSync(filePath).size,
        loadOrder: metadata.loadOrder || 50,
        lazy: metadata.lazy !== false,
        ...metadata,
      },
      integrity,
      category: metadata.category || 'utility',
      exports: await this.extractExports(filePath),
      filePath,
    };
  }

  /**
   * Generate categories based on discovered plugins
   */
  private generateCategories(): PluginCategory[] {
    const categories = new Map<string, PluginCategory>();

    // Add configured categories
    this.options.categories.forEach(config => {
      categories.set(config.id, {
        id: config.id,
        name: config.name,
        description: config.description,
        plugins: [],
      });
    });

    // Add default categories
    const defaultCategories = [
      { id: 'integration', name: 'Integration', description: 'Data integration and import plugins' },
      { id: 'processing', name: 'Processing', description: 'Data processing and transformation plugins' },
      { id: 'visualization', name: 'Visualization', description: 'Data visualization and charting plugins' },
      { id: 'utility', name: 'Utility', description: 'Utility and helper plugins' },
      { id: 'ml', name: 'Machine Learning', description: 'Machine learning and AI plugins' },
    ];

    defaultCategories.forEach(cat => {
      if (!categories.has(cat.id)) {
        categories.set(cat.id, { ...cat, plugins: [] });
      }
    });

    // Assign plugins to categories
    this.discoveredPlugins.forEach(plugin => {
      const category = categories.get(plugin.category);
      if (category) {
        category.plugins.push(plugin.id);
      }
    });

    return Array.from(categories.values()).filter(cat => cat.plugins.length > 0);
  }

  /**
   * Validate discovered plugins
   */
  private async validateDiscoveredPlugins(): Promise<void> {
    console.log('🔍 Validating plugins...');
    
    const validatedPlugins: DiscoveredPlugin[] = [];
    
    for (const plugin of this.discoveredPlugins) {
      try {
        await this.validatePlugin(plugin);
        validatedPlugins.push(plugin);
      } catch (error) {
        console.warn(`⚠️  Plugin validation failed for ${plugin.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    this.discoveredPlugins = validatedPlugins;
    console.log(`✅ ${validatedPlugins.length} plugins validated successfully`);
  }

  /**
   * Validate a single plugin
   */
  private async validatePlugin(plugin: DiscoveredPlugin): Promise<void> {
    // Check if entry file exists
    if (!existsSync(plugin.filePath)) {
      throw new Error(`Entry file not found: ${plugin.filePath}`);
    }

    // Validate dependencies exist
    for (const depId of plugin.dependencies) {
      const dependency = this.discoveredPlugins.find(p => p.id === depId);
      if (!dependency) {
        console.warn(`⚠️  Dependency not found for ${plugin.id}: ${depId}`);
      }
    }

    // Try to parse the plugin file (basic syntax check)
    try {
      const content = readFileSync(plugin.filePath, 'utf8');
      if (plugin.filePath.endsWith('.js') || plugin.filePath.endsWith('.ts')) {
        // Basic syntax validation - could be enhanced with actual parsing
        if (!content.includes('export') && !content.includes('module.exports')) {
          console.warn(`⚠️  Plugin ${plugin.id} may not have proper exports`);
        }
      }
    } catch (error) {
      throw new Error(`Failed to read plugin file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Write manifest to file
   */
  private async writeManifest(manifest: PluginManifest): Promise<void> {
    const manifestJson = JSON.stringify(manifest, null, 2);
    writeFileSync(this.options.outputPath, manifestJson, 'utf8');
    
    // Also write a compressed version
    const compressedPath = this.options.outputPath.replace('.json', '.min.json');
    writeFileSync(compressedPath, JSON.stringify(manifest), 'utf8');
    
    console.log(`📄 Manifest written to: ${this.options.outputPath}`);
    console.log(`📄 Compressed manifest: ${compressedPath}`);
  }

  /**
   * Helper methods
   */
  private isPluginFile(filename: string): boolean {
    const pluginExtensions = ['.js', '.ts', '.mjs'];
    const pluginPatterns = [/plugin/i, /extension/i];
    
    return pluginExtensions.includes(extname(filename)) &&
           pluginPatterns.some(pattern => pattern.test(filename));
  }

  private isDataPrismPlugin(packageJson: any): boolean {
    return packageJson.keywords?.includes('dataprism-plugin') ||
           packageJson.peerDependencies?.['@dataprism/core'] ||
           packageJson.dependencies?.['@dataprism/core'] ||
           packageJson.name?.includes('dataprism');
  }

  private isDevPlugin(packageJson: any): boolean {
    return packageJson.private === true ||
           packageJson.name?.includes('dev') ||
           packageJson.name?.includes('test') ||
           packageJson.name?.includes('example');
  }

  private generatePluginId(name: string): string {
    return name.toLowerCase()
      .replace(/[@/]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private findEntryFile(pluginPath: string, packageJson: any): string | null {
    // Check package.json main/module fields
    const entryFields = ['module', 'main', 'entry'];
    
    for (const field of entryFields) {
      if (packageJson[field]) {
        const entryPath = resolve(pluginPath, packageJson[field]);
        if (existsSync(entryPath)) {
          return entryPath;
        }
      }
    }

    // Look for common entry files
    const commonEntries = ['index.js', 'index.ts', 'plugin.js', 'plugin.ts', 'main.js', 'main.ts'];
    
    for (const entry of commonEntries) {
      const entryPath = join(pluginPath, entry);
      if (existsSync(entryPath)) {
        return entryPath;
      }
    }

    return null;
  }

  private getRelativePath(filePath: string): string {
    // Convert absolute path to relative path from base URL
    return filePath.replace(process.cwd(), '').replace(/^[/\\]/, '');
  }

  private extractDependencies(packageJson: any): string[] {
    const deps: string[] = [];
    
    // Extract DataPrism plugin dependencies
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies,
    };

    Object.keys(allDeps || {}).forEach(dep => {
      if (dep.includes('dataprism') || dep.includes('plugin')) {
        deps.push(this.generatePluginId(dep));
      }
    });

    return deps;
  }

  private extractMetadata(packageJson: any, filePath: string): PluginMetadata {
    const stats = statSync(filePath);
    
    return {
      description: packageJson.description || 'DataPrism plugin',
      author: packageJson.author?.name || packageJson.author || 'Unknown',
      license: packageJson.license || 'MIT',
      homepage: packageJson.homepage,
      repository: packageJson.repository?.url || packageJson.repository,
      keywords: packageJson.keywords || [],
      size: stats.size,
      loadOrder: packageJson.dataprism?.loadOrder || 50,
      lazy: packageJson.dataprism?.lazy !== false,
    };
  }

  private extractMetadataFromComments(content: string, filePath: string): any {
    const metadata: any = {};
    
    // Extract metadata from JSDoc-style comments
    const commentMatches = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (commentMatches) {
      const comment = commentMatches[1];
      
      // Extract @tag value patterns
      const tags = {
        name: /@name\s+(.+)/,
        version: /@version\s+(.+)/,
        description: /@description\s+([\s\S]*?)(?=@|\*\/)/,
        author: /@author\s+(.+)/,
        license: /@license\s+(.+)/,
        category: /@category\s+(.+)/,
        dependencies: /@dependencies?\s+(.+)/,
        loadOrder: /@loadOrder\s+(\d+)/,
        lazy: /@lazy\s+(true|false)/,
      };

      Object.entries(tags).forEach(([key, regex]) => {
        const match = comment.match(regex);
        if (match) {
          let value = match[1].trim();
          
          if (key === 'dependencies') {
            metadata[key] = value.split(/[,\s]+/).filter(Boolean);
          } else if (key === 'loadOrder') {
            metadata[key] = parseInt(value);
          } else if (key === 'lazy') {
            metadata[key] = value === 'true';
          } else {
            metadata[key] = value;
          }
        }
      });
    }

    return metadata;
  }

  private async extractExports(filePath: string): Promise<string[]> {
    try {
      const content = readFileSync(filePath, 'utf8');
      const exports: string[] = [];

      // Extract named exports
      const namedExports = content.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/g);
      if (namedExports) {
        namedExports.forEach(exp => {
          const match = exp.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/);
          if (match) {
            exports.push(match[1]);
          }
        });
      }

      // Check for default export
      if (content.includes('export default')) {
        exports.push('default');
      }

      // Extract from export { } statements
      const exportStatements = content.match(/export\s*\{\s*([^}]+)\s*\}/g);
      if (exportStatements) {
        exportStatements.forEach(statement => {
          const match = statement.match(/export\s*\{\s*([^}]+)\s*\}/);
          if (match) {
            const names = match[1].split(',').map(name => name.trim().split(' as ')[0]);
            exports.push(...names);
          }
        });
      }

      return [...new Set(exports)]; // Remove duplicates
    } catch (error) {
      console.warn(`⚠️  Failed to extract exports from ${filePath}:`, error instanceof Error ? error.message : String(error));
      return ['default'];
    }
  }

  private categorizePlugin(packageJson: any): string {
    const keywords = packageJson.keywords || [];
    const name = packageJson.name.toLowerCase();
    const description = (packageJson.description || '').toLowerCase();

    // Category mapping
    const categoryMappings = [
      { keywords: ['integration', 'import', 'export', 'connector'], category: 'integration' },
      { keywords: ['processing', 'transform', 'etl', 'data'], category: 'processing' },
      { keywords: ['visualization', 'chart', 'graph', 'plot'], category: 'visualization' },
      { keywords: ['ml', 'ai', 'machine-learning', 'neural'], category: 'ml' },
      { keywords: ['utility', 'helper', 'tool'], category: 'utility' },
    ];

    for (const mapping of categoryMappings) {
      const hasKeyword = mapping.keywords.some(keyword => 
        keywords.includes(keyword) || 
        name.includes(keyword) || 
        description.includes(keyword)
      );
      
      if (hasKeyword) {
        return mapping.category;
      }
    }

    return 'utility';
  }

  private async generateIntegrity(filePath: string): Promise<string> {
    const content = readFileSync(filePath);
    const hash = createHash('sha384').update(content).digest('base64');
    return `sha384-${hash}`;
  }

  private printManifestSummary(manifest: PluginManifest): void {
    console.log('\n📊 Plugin Manifest Summary:');
    console.log(`  Total plugins: ${manifest.plugins.length}`);
    console.log(`  Categories: ${manifest.categories.length}`);
    
    manifest.categories.forEach(category => {
      console.log(`    ${category.name}: ${category.plugins.length} plugins`);
    });

    const totalSize = manifest.plugins.reduce((sum, plugin) => sum + plugin.metadata.size, 0);
    console.log(`  Total size: ${this.formatSize(totalSize)}`);
    console.log(`  Base URL: ${manifest.baseUrl}`);
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI interface for standalone usage
export async function generatePluginManifest(options: PluginDiscoveryOptions): Promise<PluginManifest> {
  const generator = new PluginManifestGenerator(options);
  return generator.generateManifest();
}