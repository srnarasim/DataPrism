import { PluginManifest } from '../interfaces/plugin.js';

export class PluginRegistry {
  private manifests: Map<string, PluginManifest>;
  private dependencies: Map<string, Set<string>>;
  private categories: Map<string, Set<string>>;
  private loadOrder: string[] | null = null;

  constructor() {
    this.manifests = new Map();
    this.dependencies = new Map();
    this.categories = new Map();
  }

  async register(manifest: PluginManifest): Promise<void> {
    const name = manifest.name;
    
    // Check for conflicts
    if (this.manifests.has(name)) {
      const existing = this.manifests.get(name)!;
      if (existing.version !== manifest.version) {
        throw new Error(`Plugin version conflict: ${name} ${existing.version} vs ${manifest.version}`);
      }
      // Allow re-registration of same version
      return;
    }

    // Store manifest
    this.manifests.set(name, manifest);

    // Index dependencies
    const deps = new Set<string>();
    for (const dep of manifest.dependencies) {
      if (!dep.optional) {
        deps.add(dep.name);
      }
    }
    this.dependencies.set(name, deps);

    // Index by category
    if (!this.categories.has(manifest.category)) {
      this.categories.set(manifest.category, new Set());
    }
    this.categories.get(manifest.category)!.add(name);

    // Invalidate load order cache
    this.loadOrder = null;

    // Validate dependency tree
    await this.validateDependencies(name);
  }

  async unregister(pluginName: string): Promise<void> {
    const manifest = this.manifests.get(pluginName);
    if (!manifest) return;

    // Check if other plugins depend on this one
    const dependents = this.getDependents(pluginName);
    if (dependents.length > 0) {
      throw new Error(`Cannot unregister ${pluginName}: required by ${dependents.join(', ')}`);
    }

    // Remove from indexes
    this.manifests.delete(pluginName);
    this.dependencies.delete(pluginName);
    
    const category = manifest.category;
    if (this.categories.has(category)) {
      this.categories.get(category)!.delete(pluginName);
      if (this.categories.get(category)!.size === 0) {
        this.categories.delete(category);
      }
    }

    // Invalidate load order cache
    this.loadOrder = null;
  }

  getManifest(pluginName: string): PluginManifest | null {
    return this.manifests.get(pluginName) || null;
  }

  getAllManifests(): PluginManifest[] {
    return Array.from(this.manifests.values());
  }

  getPluginsByCategory(category: string): string[] {
    return Array.from(this.categories.get(category) || []);
  }

  getDependencies(pluginName: string): string[] {
    return Array.from(this.dependencies.get(pluginName) || []);
  }

  getDependents(pluginName: string): string[] {
    const dependents: string[] = [];
    for (const [name, deps] of this.dependencies) {
      if (deps.has(pluginName)) {
        dependents.push(name);
      }
    }
    return dependents;
  }

  getLoadOrder(): string[] {
    if (this.loadOrder !== null) {
      return [...this.loadOrder];
    }

    // Topological sort for dependency resolution
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving ${name}`);
      }
      if (visited.has(name)) return;

      visiting.add(name);
      
      const deps = this.dependencies.get(name) || new Set();
      for (const dep of deps) {
        if (this.manifests.has(dep)) {
          visit(dep);
        }
      }
      
      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    for (const name of this.manifests.keys()) {
      visit(name);
    }

    this.loadOrder = order;
    return [...order];
  }

  search(query: PluginSearchQuery): PluginSearchResult[] {
    const results: PluginSearchResult[] = [];
    
    for (const manifest of this.manifests.values()) {
      let score = 0;
      let matches: PluginSearchMatch[] = [];

      // Name match
      if (query.name && manifest.name.toLowerCase().includes(query.name.toLowerCase())) {
        score += 10;
        matches.push({ field: 'name', value: manifest.name });
      }

      // Category match
      if (query.category && manifest.category === query.category) {
        score += 8;
        matches.push({ field: 'category', value: manifest.category });
      }

      // Keywords match
      if (query.keywords) {
        for (const keyword of query.keywords) {
          if (manifest.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))) {
            score += 5;
            matches.push({ field: 'keywords', value: keyword });
          }
        }
      }

      // Description match
      if (query.description && manifest.description.toLowerCase().includes(query.description.toLowerCase())) {
        score += 3;
        matches.push({ field: 'description', value: manifest.description });
      }

      // Author match
      if (query.author && manifest.author.toLowerCase().includes(query.author.toLowerCase())) {
        score += 2;
        matches.push({ field: 'author', value: manifest.author });
      }

      if (score > 0) {
        results.push({
          manifest,
          score,
          matches
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    
    // Apply limit if specified
    if (query.limit && query.limit > 0) {
      return results.slice(0, query.limit);
    }

    return results;
  }

  getStatistics(): PluginRegistryStatistics {
    const categoryStats = new Map<string, number>();
    const authorStats = new Map<string, number>();
    let totalDependencies = 0;

    for (const manifest of this.manifests.values()) {
      // Category statistics
      const count = categoryStats.get(manifest.category) || 0;
      categoryStats.set(manifest.category, count + 1);

      // Author statistics
      const authorCount = authorStats.get(manifest.author) || 0;
      authorStats.set(manifest.author, authorCount + 1);

      // Dependency count
      totalDependencies += manifest.dependencies.length;
    }

    return {
      totalPlugins: this.manifests.size,
      categories: Object.fromEntries(categoryStats),
      authors: Object.fromEntries(authorStats),
      averageDependencies: this.manifests.size > 0 ? totalDependencies / this.manifests.size : 0,
      circularDependencies: this.detectCircularDependencies()
    };
  }

  validateManifest(manifest: PluginManifest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!manifest.name || manifest.name.trim() === '') {
      errors.push('Plugin name is required');
    }

    if (!manifest.version || !this.isValidVersion(manifest.version)) {
      errors.push('Valid plugin version is required (semver format)');
    }

    if (!manifest.entryPoint || manifest.entryPoint.trim() === '') {
      errors.push('Entry point is required');
    }

    if (!manifest.category) {
      errors.push('Plugin category is required');
    }

    // Category validation
    const validCategories = ['data-processing', 'visualization', 'integration', 'utility'];
    if (manifest.category && !validCategories.includes(manifest.category)) {
      errors.push(`Invalid category: ${manifest.category}. Must be one of: ${validCategories.join(', ')}`);
    }

    // Dependencies validation
    for (const dep of manifest.dependencies || []) {
      if (!dep.name || !dep.version) {
        errors.push('Dependency must have name and version');
      }
      if (!this.isValidVersion(dep.version)) {
        errors.push(`Invalid dependency version: ${dep.version}`);
      }
    }

    // Permissions validation
    for (const perm of manifest.permissions || []) {
      if (!perm.resource || !perm.access) {
        errors.push('Permission must have resource and access fields');
      }
      const validAccess = ['read', 'write', 'execute'];
      if (perm.access && !validAccess.includes(perm.access)) {
        errors.push(`Invalid permission access: ${perm.access}`);
      }
    }

    // Compatibility validation
    if (manifest.compatibility) {
      if (!manifest.compatibility.minCoreVersion) {
        warnings.push('Minimum core version not specified');
      }
      if (!manifest.compatibility.browsers || manifest.compatibility.browsers.length === 0) {
        warnings.push('Supported browsers not specified');
      }
    }

    // Best practices warnings
    if (!manifest.description || manifest.description.length < 10) {
      warnings.push('Plugin description should be at least 10 characters');
    }

    if (!manifest.keywords || manifest.keywords.length === 0) {
      warnings.push('Adding keywords improves plugin discoverability');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async validateDependencies(pluginName: string): Promise<void> {
    const manifest = this.manifests.get(pluginName)!;
    
    for (const dep of manifest.dependencies) {
      if (!dep.optional && !this.manifests.has(dep.name)) {
        throw new Error(`Missing dependency: ${pluginName} requires ${dep.name}`);
      }
      
      // Check version compatibility
      const depManifest = this.manifests.get(dep.name);
      if (depManifest && !this.isVersionCompatible(dep.version, depManifest.version)) {
        throw new Error(`Version mismatch: ${pluginName} requires ${dep.name}@${dep.version}, found ${depManifest.version}`);
      }
    }
  }

  private isValidVersion(version: string): boolean {
    // Simple semver validation
    return /^\d+\.\d+\.\d+(-[\w\d\-]+)?(\+[\w\d\-]+)?$/.test(version);
  }

  private isVersionCompatible(required: string, available: string): boolean {
    // Simple semver compatibility check
    if (required === '*' || required === available) return true;
    
    // For now, exact match required. In production, implement proper semver range checking
    return required === available;
  }

  private detectCircularDependencies(): string[] {
    const cycles: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string, path: string[]): void => {
      if (visiting.has(name)) {
        const cycleStart = path.indexOf(name);
        const cycle = path.slice(cycleStart).concat(name);
        cycles.push(cycle.join(' -> '));
        return;
      }
      if (visited.has(name)) return;

      visiting.add(name);
      const deps = this.dependencies.get(name) || new Set();
      
      for (const dep of deps) {
        if (this.manifests.has(dep)) {
          visit(dep, [...path, name]);
        }
      }
      
      visiting.delete(name);
      visited.add(name);
    };

    for (const name of this.manifests.keys()) {
      if (!visited.has(name)) {
        visit(name, []);
      }
    }

    return cycles;
  }
}

export interface PluginSearchQuery {
  name?: string;
  category?: string;
  keywords?: string[];
  description?: string;
  author?: string;
  limit?: number;
}

export interface PluginSearchResult {
  manifest: PluginManifest;
  score: number;
  matches: PluginSearchMatch[];
}

export interface PluginSearchMatch {
  field: string;
  value: string;
}

export interface PluginRegistryStatistics {
  totalPlugins: number;
  categories: Record<string, number>;
  authors: Record<string, number>;
  averageDependencies: number;
  circularDependencies: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}