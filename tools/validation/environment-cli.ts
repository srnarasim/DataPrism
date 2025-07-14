#!/usr/bin/env tsx

/**
 * Environment Validation CLI
 * Standalone command-line interface for environment validation
 */

import { EnvironmentValidator, validateEnvironment, quickValidation } from './environment-validator';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🔍 DataPrism Environment Validator');
  console.log('═'.repeat(40));
  
  try {
    switch (command) {
      case '--quick':
      case '-q':
        console.log('Running quick validation...');
        const quickResult = await quickValidation();
        process.exit(quickResult ? 0 : 1);
        
      case '--lockfiles-only':
      case '-l':
        console.log('Validating lock files only...');
        const validator = new EnvironmentValidator();
        const lockResult = await validator.validateLockFiles();
        process.exit(lockResult ? 0 : 1);
        
      case '--help':
      case '-h':
        console.log(`
Usage: tsx tools/validation/environment-cli.ts [options]

Options:
  --quick, -q           Run quick validation (essential checks only)
  --lockfiles-only, -l  Validate lock files synchronization only
  --help, -h           Show this help message

Examples:
  tsx tools/validation/environment-cli.ts
  tsx tools/validation/environment-cli.ts --quick
  tsx tools/validation/environment-cli.ts --lockfiles-only
`);
        process.exit(0);
        
      default:
        console.log('Running full environment validation...');
        const fullResult = await validateEnvironment();
        process.exit(fullResult ? 0 : 1);
    }
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}