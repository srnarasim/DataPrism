/**
 * Environment Validator for DataPrism CI/CD Robustness
 * Validates development and CI environments for consistent builds
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ToolVersion {
  name: string;
  command: string;
  versionRegex: RegExp;
  required: string;
  installed?: string;
  isValid?: boolean;
}

export interface EnvironmentCheck {
  name: string;
  description: string;
  check: () => Promise<boolean> | boolean;
  required: boolean;
  error?: string;
}

export interface ValidationResult {
  success: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    error?: string;
    details?: any;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export class EnvironmentValidator {
  private projectRoot: string;
  private toolVersions: ToolVersion[];
  private environmentChecks: EnvironmentCheck[];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.initializeToolVersions();
    this.initializeEnvironmentChecks();
  }

  /**
   * Run complete environment validation
   */
  async validateEnvironment(): Promise<ValidationResult> {
    console.log('🔍 Running environment validation...');
    
    const results: ValidationResult = {
      success: true,
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    // Validate tool versions
    for (const tool of this.toolVersions) {
      const checkResult = await this.validateToolVersion(tool);
      results.checks.push(checkResult);
      
      if (!checkResult.passed) {
        results.success = false;
      }
    }

    // Run environment checks
    for (const check of this.environmentChecks) {
      const checkResult = await this.runEnvironmentCheck(check);
      results.checks.push(checkResult);
      
      if (!checkResult.passed && check.required) {
        results.success = false;
      }
    }

    // Calculate summary
    results.summary.total = results.checks.length;
    results.summary.passed = results.checks.filter(c => c.passed).length;
    results.summary.failed = results.checks.filter(c => !c.passed).length;
    results.summary.warnings = results.checks.filter(c => !c.passed && c.name.includes('warning')).length;

    this.printValidationResults(results);
    return results;
  }

  /**
   * Validate lock files are in sync
   */
  async validateLockFiles(): Promise<boolean> {
    console.log('🔒 Validating lock files...');
    
    const lockFiles = [
      { name: 'package-lock.json', packageFile: 'package.json' },
      { name: 'Cargo.lock', packageFile: 'Cargo.toml' }
    ];

    let allValid = true;

    for (const lockFile of lockFiles) {
      const lockPath = join(this.projectRoot, lockFile.name);
      const packagePath = join(this.projectRoot, lockFile.packageFile);

      if (!existsSync(packagePath)) {
        console.log(`⚠️ ${lockFile.packageFile} not found, skipping ${lockFile.name} validation`);
        continue;
      }

      if (!existsSync(lockPath)) {
        console.error(`❌ ${lockFile.name} not found but ${lockFile.packageFile} exists`);
        allValid = false;
        continue;
      }

      // Check if lock file is newer than package file
      const fs = await import('fs');
      const lockStats = fs.statSync(lockPath);
      const packageStats = fs.statSync(packagePath);

      if (packageStats.mtime > lockStats.mtime) {
        console.error(`❌ ${lockFile.name} is older than ${lockFile.packageFile}`);
        allValid = false;
      } else {
        console.log(`✅ ${lockFile.name} is up to date`);
      }
    }

    return allValid;
  }

  /**
   * Validate Node.js and npm versions
   */
  async validateNodeEnvironment(): Promise<boolean> {
    console.log('📦 Validating Node.js environment...');
    
    try {
      const nodeVersion = this.getCommandVersion('node --version');
      const npmVersion = this.getCommandVersion('npm --version');
      
      const packageJson = JSON.parse(readFileSync(join(this.projectRoot, 'package.json'), 'utf8'));
      const engines = packageJson.engines || {};
      
      console.log(`Node.js version: ${nodeVersion}`);
      console.log(`npm version: ${npmVersion}`);
      
      // Validate Node.js version
      if (engines.node) {
        const nodeValid = this.isVersionCompatible(nodeVersion, engines.node);
        if (!nodeValid) {
          console.error(`❌ Node.js version ${nodeVersion} does not satisfy ${engines.node}`);
          return false;
        }
      }
      
      // Validate npm version
      if (engines.npm) {
        const npmValid = this.isVersionCompatible(npmVersion, engines.npm);
        if (!npmValid) {
          console.error(`❌ npm version ${npmVersion} does not satisfy ${engines.npm}`);
          return false;
        }
      }
      
      console.log('✅ Node.js environment is valid');
      return true;
    } catch (error) {
      console.error('❌ Failed to validate Node.js environment:', error);
      return false;
    }
  }

  /**
   * Validate Rust toolchain
   */
  async validateRustToolchain(): Promise<boolean> {
    console.log('🦀 Validating Rust toolchain...');
    
    try {
      // Check rustc
      const rustcVersion = this.getCommandVersion('rustc --version');
      console.log(`rustc version: ${rustcVersion}`);
      
      // Check cargo
      const cargoVersion = this.getCommandVersion('cargo --version');
      console.log(`cargo version: ${cargoVersion}`);
      
      // Check wasm-pack
      try {
        const wasmPackVersion = this.getCommandVersion('wasm-pack --version');
        console.log(`wasm-pack version: ${wasmPackVersion}`);
      } catch (error) {
        console.error('❌ wasm-pack not found. Install with: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh');
        return false;
      }
      
      // Check wasm32 target
      try {
        execSync('rustup target list --installed | grep wasm32-unknown-unknown', { stdio: 'pipe' });
        console.log('✅ wasm32-unknown-unknown target is installed');
      } catch (error) {
        console.error('❌ wasm32-unknown-unknown target not installed. Run: rustup target add wasm32-unknown-unknown');
        return false;
      }
      
      console.log('✅ Rust toolchain is valid');
      return true;
    } catch (error) {
      console.error('❌ Failed to validate Rust toolchain:', error);
      return false;
    }
  }

  /**
   * Validate build dependencies
   */
  async validateBuildDependencies(): Promise<boolean> {
    console.log('🔧 Validating build dependencies...');
    
    try {
      // Check if node_modules exists and is populated
      const nodeModulesPath = join(this.projectRoot, 'node_modules');
      if (!existsSync(nodeModulesPath)) {
        console.error('❌ node_modules not found. Run: npm install');
        return false;
      }
      
      // Check critical dependencies
      const criticalDeps = ['vite', '@playwright/test', 'vitest'];
      for (const dep of criticalDeps) {
        const depPath = join(nodeModulesPath, dep);
        if (!existsSync(depPath)) {
          console.error(`❌ Critical dependency ${dep} not found`);
          return false;
        }
      }
      
      console.log('✅ Build dependencies are valid');
      return true;
    } catch (error) {
      console.error('❌ Failed to validate build dependencies:', error);
      return false;
    }
  }

  /**
   * Initialize tool version requirements
   */
  private initializeToolVersions(): void {
    this.toolVersions = [
      {
        name: 'Node.js',
        command: 'node --version',
        versionRegex: /v(\d+\.\d+\.\d+)/,
        required: '>=18.0.0'
      },
      {
        name: 'npm',
        command: 'npm --version',
        versionRegex: /(\d+\.\d+\.\d+)/,
        required: '>=8.0.0'
      },
      {
        name: 'Rust',
        command: 'rustc --version',
        versionRegex: /rustc (\d+\.\d+\.\d+)/,
        required: '>=1.70.0'
      },
      {
        name: 'Cargo',
        command: 'cargo --version',
        versionRegex: /cargo (\d+\.\d+\.\d+)/,
        required: '>=1.70.0'
      },
      {
        name: 'wasm-pack',
        command: 'wasm-pack --version',
        versionRegex: /wasm-pack (\d+\.\d+\.\d+)/,
        required: '>=0.12.0'
      }
    ];
  }

  /**
   * Initialize environment checks
   */
  private initializeEnvironmentChecks(): void {
    this.environmentChecks = [
      {
        name: 'Lock Files Sync',
        description: 'Verify package lock files are up to date',
        check: () => this.validateLockFiles(),
        required: true
      },
      {
        name: 'Node.js Environment',
        description: 'Validate Node.js and npm versions',
        check: () => this.validateNodeEnvironment(),
        required: true
      },
      {
        name: 'Rust Toolchain',
        description: 'Validate Rust compiler and tools',
        check: () => this.validateRustToolchain(),
        required: true
      },
      {
        name: 'Build Dependencies',
        description: 'Check critical build dependencies',
        check: () => this.validateBuildDependencies(),
        required: true
      },
      {
        name: 'Git Repository',
        description: 'Verify Git repository status',
        check: () => this.validateGitRepository(),
        required: false
      },
      {
        name: 'Available Memory',
        description: 'Check available system memory',
        check: () => this.validateSystemResources(),
        required: false
      }
    ];
  }

  /**
   * Validate tool version
   */
  private async validateToolVersion(tool: ToolVersion): Promise<{ name: string; passed: boolean; error?: string; details?: any }> {
    try {
      const output = execSync(tool.command, { encoding: 'utf8', stdio: 'pipe' });
      const match = output.match(tool.versionRegex);
      
      if (!match) {
        return {
          name: tool.name,
          passed: false,
          error: `Could not parse version from: ${output.trim()}`
        };
      }
      
      tool.installed = match[1];
      tool.isValid = this.isVersionCompatible(tool.installed, tool.required);
      
      return {
        name: tool.name,
        passed: tool.isValid,
        error: tool.isValid ? undefined : `Version ${tool.installed} does not satisfy ${tool.required}`,
        details: {
          installed: tool.installed,
          required: tool.required
        }
      };
    } catch (error) {
      return {
        name: tool.name,
        passed: false,
        error: `Command failed: ${tool.command}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Run environment check
   */
  private async runEnvironmentCheck(check: EnvironmentCheck): Promise<{ name: string; passed: boolean; error?: string }> {
    try {
      const result = await check.check();
      return {
        name: check.name,
        passed: result,
        error: result ? undefined : check.error || `${check.description} failed`
      };
    } catch (error) {
      return {
        name: check.name,
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * Validate Git repository
   */
  private validateGitRepository(): boolean {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      
      if (status.trim()) {
        console.log('⚠️ Git repository has uncommitted changes');
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate system resources
   */
  private async validateSystemResources(): Promise<boolean> {
    try {
      const os = await import('os');
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const memoryGB = totalMemory / (1024 * 1024 * 1024);
      
      console.log(`Total memory: ${memoryGB.toFixed(2)}GB`);
      console.log(`Free memory: ${(freeMemory / (1024 * 1024 * 1024)).toFixed(2)}GB`);
      
      if (memoryGB < 4) {
        console.warn('⚠️ Less than 4GB RAM available, builds may be slow');
      }
      
      return true;
    } catch (error) {
      console.warn('⚠️ Could not check system memory:', error.message);
      return true; // Non-critical check
    }
  }

  /**
   * Get version from command output
   */
  private getCommandVersion(command: string): string {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output.trim();
  }

  /**
   * Check if version satisfies requirement
   */
  private isVersionCompatible(installed: string, required: string): boolean {
    // Simple semver compatibility check
    const installedParts = installed.replace(/^v/, '').split('.').map(Number);
    const requiredParts = required.replace(/^>=/, '').replace(/^v/, '').split('.').map(Number);
    
    for (let i = 0; i < Math.max(installedParts.length, requiredParts.length); i++) {
      const installedPart = installedParts[i] || 0;
      const requiredPart = requiredParts[i] || 0;
      
      if (installedPart > requiredPart) return true;
      if (installedPart < requiredPart) return false;
    }
    
    return true; // Equal versions
  }

  /**
   * Print validation results
   */
  private printValidationResults(results: ValidationResult): void {
    console.log('\n📊 Environment Validation Results');
    console.log('═'.repeat(50));
    
    for (const check of results.checks) {
      const status = check.passed ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
      
      if (check.error) {
        console.log(`   Error: ${check.error}`);
      }
      
      if (check.details) {
        if (check.details.installed && check.details.required) {
          console.log(`   Installed: ${check.details.installed}, Required: ${check.details.required}`);
        }
      }
    }
    
    console.log('\n📈 Summary');
    console.log(`Total checks: ${results.summary.total}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Warnings: ${results.summary.warnings}`);
    
    if (results.success) {
      console.log('\n🎉 Environment validation passed!');
    } else {
      console.log('\n💥 Environment validation failed!');
      console.log('Please fix the issues above before proceeding.');
    }
  }
}

/**
 * CLI function for standalone usage
 */
export async function validateEnvironment(projectRoot?: string): Promise<boolean> {
  const validator = new EnvironmentValidator(projectRoot);
  const results = await validator.validateEnvironment();
  return results.success;
}

/**
 * Quick validation function for CI
 */
export async function quickValidation(): Promise<boolean> {
  const validator = new EnvironmentValidator();
  
  console.log('🚀 Running quick environment validation...');
  
  const checks = [
    () => validator.validateLockFiles(),
    () => validator.validateNodeEnvironment(),
    () => validator.validateRustToolchain(),
    () => validator.validateBuildDependencies()
  ];
  
  for (const check of checks) {
    const result = await check();
    if (!result) {
      return false;
    }
  }
  
  console.log('✅ Quick validation passed!');
  return true;
}