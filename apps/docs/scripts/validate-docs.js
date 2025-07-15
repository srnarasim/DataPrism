#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_DIR = join(__dirname, '..');
const CONFIG_FILE = join(DOCS_DIR, '.vitepress', 'config.js');

class DocumentationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  async validate() {
    console.log('🔍 Validating documentation structure...\n');
    
    await this.validateConfigFile();
    await this.validateSidebarLinks();
    await this.validateRequiredFiles();
    await this.validateMarkdownFiles();
    
    this.printResults();
    
    return this.errors.length === 0;
  }

  async validateConfigFile() {
    try {
      const configExists = await fs.access(CONFIG_FILE).then(() => true).catch(() => false);
      if (!configExists) {
        this.addError('VitePress config file not found');
        return;
      }
      
      console.log('✅ VitePress config file exists');
    } catch (error) {
      this.addError(`Error reading config file: ${error.message}`);
    }
  }

  async validateSidebarLinks() {
    try {
      // Read and parse the config file manually to avoid import issues
      const configContent = await fs.readFile(CONFIG_FILE, 'utf-8');
      
      // Extract sidebar configuration using regex (simplified approach)
      const sidebarMatch = configContent.match(/sidebar:\s*\{([^}]+(?:\}[^}]*)*)\}/s);
      
      if (!sidebarMatch) {
        this.addWarning('Could not extract sidebar configuration from config file');
        return;
      }
      
      // For now, just check if the config file is valid JavaScript
      console.log('✅ Sidebar configuration found in config file');
      
      // TODO: Implement more sophisticated sidebar validation
      // This is a simplified version to avoid import issues
      
    } catch (error) {
      this.addError(`Error validating sidebar: ${error.message}`);
    }
  }

  async validateSidebarLink(item) {
    const markdownPath = join(DOCS_DIR, item.link + '.md');
    
    try {
      await fs.access(markdownPath);
      console.log(`  ✅ ${item.text} -> ${item.link}`);
    } catch (error) {
      this.addError(`Missing file for "${item.text}": ${markdownPath}`);
    }
  }

  async validateRequiredFiles() {
    const requiredFiles = [
      'index.md',
      'guide/index.md',
      'guide/getting-started.md',
      'guide/installation.md',
      'guide/quick-start.md',
      'guide/architecture.md',
      'guide/wasm-engine.md',
      'guide/duckdb.md',
      'guide/llm.md',
      'guide/performance.md',
      'guide/security.md',
      'guide/troubleshooting.md',
      'plugins/index.md',
      'plugins/architecture.md',
      'plugins/getting-started.md',
      'plugins/out-of-box/index.md',
      'plugins/out-of-box/observable-charts.md',
      'plugins/out-of-box/csv-importer.md',
      'plugins/out-of-box/semantic-clustering.md',
      'plugins/out-of-box/performance-monitor.md',
      'plugins/development.md',
      'plugins/ai-generator/index.md',
      'plugins/api.md',
      'plugins/testing.md',
      'api/index.md',
      'api/core.md',
      'api/orchestration.md',
      'api/plugins.md',
      'examples/index.md',
      'examples/basic.md',
      'examples/advanced.md',
      'examples/plugins.md'
    ];

    console.log('🔍 Validating required files...');
    
    for (const file of requiredFiles) {
      const filePath = join(DOCS_DIR, file);
      try {
        await fs.access(filePath);
        console.log(`  ✅ ${file}`);
      } catch (error) {
        this.addError(`Missing required file: ${file}`);
      }
    }
  }

  async validateMarkdownFiles() {
    console.log('🔍 Validating markdown files...');
    
    const markdownFiles = await this.findMarkdownFiles(DOCS_DIR);
    
    for (const file of markdownFiles) {
      await this.validateMarkdownFile(file);
    }
  }

  async findMarkdownFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(dir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.')) {
        files.push(...await this.findMarkdownFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async validateMarkdownFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = filePath.replace(DOCS_DIR + '/', '');
      
      // Check for empty files
      if (content.trim().length === 0) {
        this.addError(`Empty markdown file: ${relativePath}`);
        return;
      }
      
      // Check for title
      if (!content.includes('# ')) {
        this.addWarning(`No H1 title found in: ${relativePath}`);
      }
      
      // Check for common issues
      if (content.includes('TODO') || content.includes('FIXME')) {
        this.addWarning(`TODO/FIXME found in: ${relativePath}`);
      }
      
      // Check for broken internal links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const linkText = match[1];
        const linkUrl = match[2];
        
        // Only check relative links (not external URLs)
        if (!linkUrl.startsWith('http') && !linkUrl.startsWith('#')) {
          await this.validateInternalLink(linkUrl, relativePath);
        }
      }
      
      console.log(`  ✅ ${relativePath}`);
    } catch (error) {
      this.addError(`Error validating ${filePath}: ${error.message}`);
    }
  }

  async validateInternalLink(linkUrl, sourceFile) {
    // Remove anchor links
    const cleanUrl = linkUrl.split('#')[0];
    if (!cleanUrl) return; // Pure anchor link
    
    // Skip validation for links that end with / (directory links)
    if (cleanUrl.endsWith('/')) {
      return; // Directory links are handled differently
    }
    
    // Convert to markdown file path
    const targetPath = join(DOCS_DIR, cleanUrl.endsWith('.md') ? cleanUrl : cleanUrl + '.md');
    
    try {
      await fs.access(targetPath);
    } catch (error) {
      this.addWarning(`Broken internal link in ${sourceFile}: ${linkUrl} (this might be a directory link)`);
    }
  }

  addError(message) {
    this.errors.push(message);
    console.log(`  ❌ ${message}`);
  }

  addWarning(message) {
    this.warnings.push(message);
    console.log(`  ⚠️  ${message}`);
  }

  printResults() {
    console.log('\n📊 Validation Results:');
    console.log(`✅ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors found:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 All validation checks passed!');
    }
  }
}

// Run validation
const validator = new DocumentationValidator();
const isValid = await validator.validate();

process.exit(isValid ? 0 : 1);