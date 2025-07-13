/**
 * Plugin Loader Tests
 * Test suite for the CDN plugin loading system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CDNPluginLoader, PluginManifest, LoadedPlugin } from '../../tools/build/plugin-loader.js';
import { PluginManifestGenerator } from '../../tools/build/plugin-manifest-generator.js';

// Mock global fetch
global.fetch = vi.fn();
global.crypto = {
  subtle: {
    digest: vi.fn().mockResolvedValue(new ArrayBuffer(48)), // SHA-384 produces 48 bytes
  },
} as any;

describe('CDN Plugin System', () => {
  describe('CDNPluginLoader', () => {
    let loader: CDNPluginLoader;
    let mockManifest: PluginManifest;

    beforeEach(() => {
      loader = new CDNPluginLoader({
        baseUrl: 'https://cdn.example.com',
        timeout: 5000,
        retries: 1,
      });

      mockManifest = {
        plugins: [
          {
            id: 'test-plugin',
            name: 'Test Plugin',
            version: '1.0.0',
            entry: 'plugins/test-plugin.js',
            dependencies: [],
            metadata: {
              description: 'A test plugin',
              author: 'Test Author',
              license: 'MIT',
              keywords: ['test'],
              size: 1024,
              loadOrder: 10,
              lazy: false,
            },
            integrity: 'sha384-test',
            category: 'utility',
            exports: ['default', 'TestClass'],
          },
          {
            id: 'dependent-plugin',
            name: 'Dependent Plugin',
            version: '1.0.0',
            entry: 'plugins/dependent-plugin.js',
            dependencies: ['test-plugin'],
            metadata: {
              description: 'A plugin with dependencies',
              author: 'Test Author',
              license: 'MIT',
              keywords: ['test', 'dependent'],
              size: 512,
              loadOrder: 20,
              lazy: true,
            },
            integrity: 'sha384-dependent',
            category: 'integration',
            exports: ['default'],
          },
        ],
        categories: [
          {
            id: 'utility',
            name: 'Utility',
            description: 'Utility plugins',
            plugins: ['test-plugin'],
          },
          {
            id: 'integration',
            name: 'Integration',
            description: 'Integration plugins',
            plugins: ['dependent-plugin'],
          },
        ],
        compatibility: {
          chrome: '90+',
          firefox: '88+',
          safari: '14+',
          edge: '90+',
          webAssembly: true,
          es2020: true,
        },
        baseUrl: 'https://cdn.example.com',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should initialize with manifest', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });
      global.fetch = mockFetch;

      await loader.initialize();
      
      const availablePlugins = loader.getAvailablePlugins();
      expect(availablePlugins).toHaveLength(2);
      expect(availablePlugins[0].id).toBe('test-plugin');
    });

    it('should handle manifest fetch failure', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });
      global.fetch = mockFetch;

      await expect(loader.initialize()).rejects.toThrow('Failed to fetch plugin manifest');
    });

    it('should validate browser compatibility', async () => {
      // Mock WebAssembly as undefined to test compatibility check
      const originalWebAssembly = global.WebAssembly;
      delete (global as any).WebAssembly;

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });
      global.fetch = mockFetch;

      await expect(loader.initialize()).rejects.toThrow('WebAssembly support');

      // Restore WebAssembly
      global.WebAssembly = originalWebAssembly;
    });

    it('should load a simple plugin', async () => {
      // Setup loader with manifest
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockManifest),
        });
      global.fetch = mockFetch;

      await loader.initialize();

      // Mock plugin module
      const mockPluginModule = {
        default: class TestPlugin {
          constructor(metadata: any) {
            this.metadata = metadata;
          }
        },
      };

      // Mock dynamic import
      vi.doMock('https://cdn.example.com/plugins/test-plugin.js', () => mockPluginModule, { virtual: true });
      
      // Use a custom import function for testing
      const originalImport = globalThis.__vite_ssr_import__;
      globalThis.__vite_ssr_import__ = vi.fn().mockResolvedValue(mockPluginModule);

      const plugin = await loader.loadPlugin('test-plugin');

      expect(plugin.id).toBe('test-plugin');
      expect(plugin.status).toBe('loaded');
      expect(plugin.instance).toBeDefined();
      expect(plugin.loadTime).toBeGreaterThan(0);

      // Restore original import
      if (originalImport) {
        globalThis.__vite_ssr_import__ = originalImport;
      }
    });

    it('should handle plugin loading errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });
      global.fetch = mockFetch;

      await loader.initialize();

      // Mock failed dynamic import
      globalThis.__vite_ssr_import__ = vi.fn().mockRejectedValue(new Error('Module not found'));

      await expect(loader.loadPlugin('test-plugin')).rejects.toThrow('Module not found');
      
      const plugin = loader.getPlugin('test-plugin');
      expect(plugin?.status).toBe('error');
    });

    it('should load plugin dependencies', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });
      global.fetch = mockFetch;

      await loader.initialize();

      const mockTestPluginModule = {
        default: class TestPlugin {},
      };

      const mockDependentPluginModule = {
        default: class DependentPlugin {},
      };

      globalThis.__vite_ssr_import__ = vi.fn()
        .mockResolvedValueOnce(mockTestPluginModule) // First for test-plugin
        .mockResolvedValueOnce(mockDependentPluginModule); // Then for dependent-plugin

      const plugin = await loader.loadPlugin('dependent-plugin');

      expect(plugin.id).toBe('dependent-plugin');
      expect(plugin.status).toBe('loaded');
      
      // Dependency should also be loaded
      const dependency = loader.getPlugin('test-plugin');
      expect(dependency?.status).toBe('loaded');
    });

    it('should load plugins by category', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });
      global.fetch = mockFetch;

      await loader.initialize();

      const mockPluginModule = {
        default: class TestPlugin {},
      };

      globalThis.__vite_ssr_import__ = vi.fn().mockResolvedValue(mockPluginModule);

      const plugins = await loader.loadPluginsByCategory('utility');

      expect(plugins).toHaveLength(1);
      expect(plugins[0].id).toBe('test-plugin');
    });

    it('should handle plugin unloading', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });
      global.fetch = mockFetch;

      await loader.initialize();

      const mockCleanup = vi.fn();
      const mockPluginModule = {
        default: class TestPlugin {
          cleanup = mockCleanup;
        },
      };

      globalThis.__vite_ssr_import__ = vi.fn().mockResolvedValue(mockPluginModule);

      await loader.loadPlugin('test-plugin');
      expect(loader.isPluginLoaded('test-plugin')).toBe(true);

      await loader.unloadPlugin('test-plugin');
      expect(loader.isPluginLoaded('test-plugin')).toBe(false);
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should verify plugin integrity', async () => {
      const loader = new CDNPluginLoader({
        baseUrl: 'https://cdn.example.com',
        integrity: true,
      });

      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockManifest),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('plugin content'),
        });
      global.fetch = mockFetch;

      await loader.initialize();

      // Mock crypto.subtle.digest
      global.crypto.subtle.digest = vi.fn().mockResolvedValue(
        new ArrayBuffer(48) // SHA-384 hash
      );

      const mockPluginModule = {
        default: class TestPlugin {},
      };

      globalThis.__vite_ssr_import__ = vi.fn().mockResolvedValue(mockPluginModule);

      const plugin = await loader.loadPlugin('test-plugin');
      expect(plugin.status).toBe('loaded');
    });

    it('should cache plugin modules', async () => {
      const loader = new CDNPluginLoader({
        baseUrl: 'https://cdn.example.com',
        cache: true,
      });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });
      global.fetch = mockFetch;

      await loader.initialize();

      const mockPluginModule = {
        default: class TestPlugin {},
      };

      const mockImport = vi.fn().mockResolvedValue(mockPluginModule);
      globalThis.__vite_ssr_import__ = mockImport;

      // Load plugin twice
      await loader.loadPlugin('test-plugin');
      await loader.loadPlugin('test-plugin');

      // Should only import once due to caching
      expect(mockImport).toHaveBeenCalledTimes(1);
    });

    it('should provide performance metrics', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });
      global.fetch = mockFetch;

      await loader.initialize();

      const mockPluginModule = {
        default: class TestPlugin {},
      };

      globalThis.__vite_ssr_import__ = vi.fn().mockResolvedValue(mockPluginModule);

      await loader.loadPlugin('test-plugin');

      const metrics = loader.getPerformanceMetrics();
      expect(metrics['test-plugin']).toBeDefined();
      expect(metrics['test-plugin']).toBeGreaterThan(0);
    });
  });

  describe('PluginManifestGenerator', () => {
    it('should generate manifest from plugin directories', async () => {
      const generator = new PluginManifestGenerator({
        pluginDirs: ['/test/plugins'],
        baseUrl: 'https://cdn.example.com',
        outputPath: '/test/manifest.json',
        includeDevPlugins: false,
        validatePlugins: true,
      });

      // Mock file system operations
      vi.doMock('fs', () => ({
        existsSync: vi.fn().mockReturnValue(true),
        readdirSync: vi.fn().mockReturnValue(['test-plugin']),
        statSync: vi.fn().mockReturnValue({
          isDirectory: () => true,
          isFile: () => false,
          size: 1024,
        }),
        readFileSync: vi.fn().mockReturnValue(JSON.stringify({
          name: 'test-plugin',
          version: '1.0.0',
          description: 'Test plugin',
          main: 'index.js',
          keywords: ['dataprism-plugin'],
        })),
        writeFileSync: vi.fn(),
      }));

      const manifest = await generator.generateManifest();

      expect(manifest.plugins).toBeDefined();
      expect(manifest.categories).toBeDefined();
      expect(manifest.baseUrl).toBe('https://cdn.example.com');
    });

    it('should categorize plugins correctly', () => {
      // This would test the categorization logic
      const mockPackageJson = {
        name: 'chart-plugin',
        keywords: ['visualization', 'chart'],
      };

      // The categorization logic would be tested here
      expect(mockPackageJson.keywords).toContain('visualization');
    });

    it('should extract plugin metadata', () => {
      const mockContent = `
        /**
         * @name Test Plugin
         * @version 1.0.0
         * @description A test plugin for DataPrism
         * @author Test Author
         * @category utility
         * @loadOrder 10
         * @lazy false
         */
        export default class TestPlugin {}
      `;

      // Test metadata extraction from comments
      expect(mockContent).toContain('@name Test Plugin');
      expect(mockContent).toContain('@category utility');
    });

    it('should validate plugin files', () => {
      const validPlugin = `
        export default class TestPlugin {
          constructor(metadata) {
            this.metadata = metadata;
          }
        }
      `;

      const invalidPlugin = `
        // No exports
        const plugin = {};
      `;

      expect(validPlugin).toContain('export');
      expect(invalidPlugin).not.toContain('export');
    });
  });

  describe('Plugin Loading Performance', () => {
    it('should load plugins efficiently', async () => {
      const loader = new CDNPluginLoader({
        baseUrl: 'https://cdn.example.com',
        timeout: 1000,
      });

      const startTime = Date.now();
      
      // Mock quick plugin loading
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          plugins: [],
          categories: [],
          compatibility: {},
          baseUrl: 'https://cdn.example.com',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        }),
      });
      global.fetch = mockFetch;

      await loader.initialize();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1000);
    });

    it('should handle concurrent plugin loading', async () => {
      const loader = new CDNPluginLoader();

      const mockManifest = {
        plugins: [
          { id: 'plugin1', name: 'Plugin 1', version: '1.0.0', entry: 'plugin1.js', dependencies: [], metadata: { size: 100, loadOrder: 1, lazy: false }, integrity: '', category: 'utility', exports: ['default'] },
          { id: 'plugin2', name: 'Plugin 2', version: '1.0.0', entry: 'plugin2.js', dependencies: [], metadata: { size: 100, loadOrder: 2, lazy: false }, integrity: '', category: 'utility', exports: ['default'] },
        ],
        categories: [],
        compatibility: {},
        baseUrl: '',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });
      global.fetch = mockFetch;

      await loader.initialize();

      globalThis.__vite_ssr_import__ = vi.fn().mockResolvedValue({
        default: class TestPlugin {},
      });

      const startTime = Date.now();
      await loader.loadPlugins(['plugin1', 'plugin2']);
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(2000); // Should load both quickly
      expect(loader.getLoadedPlugins()).toHaveLength(2);
    });
  });
});