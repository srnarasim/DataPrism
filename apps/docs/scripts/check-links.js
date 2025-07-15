#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_DIR = join(__dirname, '..');
const BUILD_DIR = join(DOCS_DIR, '.vitepress', 'dist');

class LinkChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checkedUrls = new Set();
  }

  async checkLinks() {
    console.log('🔗 Checking links in built documentation...\n');
    
    // Check if build directory exists
    try {
      await fs.access(BUILD_DIR);
    } catch (error) {
      console.log('❌ Build directory not found. Please run "npm run build" first.');
      process.exit(1);
    }
    
    await this.checkHtmlFiles();
    
    this.printResults();
    
    return this.errors.length === 0;
  }

  async checkHtmlFiles() {
    const htmlFiles = await this.findHtmlFiles(BUILD_DIR);
    
    for (const file of htmlFiles) {
      await this.checkHtmlFile(file);
    }
  }

  async findHtmlFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(dir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'assets') {
        files.push(...await this.findHtmlFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async checkHtmlFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = filePath.replace(BUILD_DIR + '/', '');
      
      // Extract links from HTML
      const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const href = match[1];
        
        // Skip external links, anchors, and JavaScript
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) {
          continue;
        }
        
        await this.validateLink(href, relativePath);
      }
      
      console.log(`  ✅ ${relativePath}`);
    } catch (error) {
      this.addError(`Error checking ${filePath}: ${error.message}`);
    }
  }

  async validateLink(href, sourceFile) {
    // Skip if already checked
    if (this.checkedUrls.has(href)) {
      return;
    }
    
    this.checkedUrls.add(href);
    
    // Handle different link types
    let targetPath;
    
    if (href.startsWith('/DataPrism/')) {
      // Absolute link with base path
      targetPath = join(BUILD_DIR, href.replace('/DataPrism/', ''));
    } else if (href.startsWith('/')) {
      // Absolute link
      targetPath = join(BUILD_DIR, href.substring(1));
    } else {
      // Relative link
      const sourceDir = dirname(join(BUILD_DIR, sourceFile));
      targetPath = join(sourceDir, href);
    }
    
    // Add .html if no extension
    if (!targetPath.includes('.') && !targetPath.endsWith('/')) {
      targetPath += '.html';
    }
    
    // Check if directory, then look for index.html
    if (targetPath.endsWith('/')) {
      targetPath = join(targetPath, 'index.html');
    }
    
    try {
      await fs.access(targetPath);
    } catch (error) {
      this.addError(`Broken link in ${sourceFile}: ${href} -> ${targetPath}`);
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
    console.log('\n📊 Link Check Results:');
    console.log(`✅ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Broken links found:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 All links are working!');
    }
  }
}

// Run link checker
const checker = new LinkChecker();
const isValid = await checker.checkLinks();

process.exit(isValid ? 0 : 1);