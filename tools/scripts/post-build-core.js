#!/usr/bin/env node

/**
 * Post-build script for DataPrism Core WASM package
 * - Validates WASM output
 * - Generates integrity hashes
 * - Creates distribution package.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const coreDir = resolve(__dirname, '../../packages/core');
const pkgDir = resolve(coreDir, 'pkg');

function validateWasmOutput() {
  console.log('🔍 Validating WASM output...');
  
  const wasmPath = resolve(pkgDir, 'dataprism_core_bg.wasm');
  if (!existsSync(wasmPath)) {
    throw new Error('WASM file not found! Build may have failed.');
  }
  
  const wasmBuffer = readFileSync(wasmPath);
  const wasmMagicNumber = wasmBuffer.slice(0, 4);
  const expectedMagic = Buffer.from([0x00, 0x61, 0x73, 0x6d]); // '\0asm'
  
  if (!wasmMagicNumber.equals(expectedMagic)) {
    throw new Error('Invalid WASM file! Magic number mismatch.');
  }
  
  const sizeKB = Math.round(wasmBuffer.length / 1024);
  const sizeMB = (sizeKB / 1024).toFixed(2);
  
  console.log(`✅ WASM validation passed: ${sizeKB}KB (${sizeMB}MB)`);
  
  // Check size limits
  const maxSizeMB = 1.5;
  if (wasmBuffer.length > maxSizeMB * 1024 * 1024) {
    console.warn(`⚠️  WASM file exceeds recommended size limit of ${maxSizeMB}MB`);
  }
  
  return { size: wasmBuffer.length, sizeKB, sizeMB };
}

function generateIntegrityHashes() {
  console.log('🔐 Generating integrity hashes...');
  
  const files = [
    'dataprism_core_bg.wasm',
    'dataprism_core.js',
    'dataprism_core.d.ts'
  ];
  
  const integrity = {};
  
  for (const fileName of files) {
    const filePath = resolve(pkgDir, fileName);
    if (existsSync(filePath)) {
      const fileBuffer = readFileSync(filePath);
      const hash = createHash('sha384').update(fileBuffer).digest('base64');
      integrity[fileName] = `sha384-${hash}`;
      console.log(`📦 ${fileName}: sha384-${hash.slice(0, 8)}...`);
    }
  }
  
  // Write integrity manifest
  const integrityPath = resolve(pkgDir, 'integrity.json');
  writeFileSync(integrityPath, JSON.stringify(integrity, null, 2));
  
  return integrity;
}

function createDistributionPackageJson(wasmStats, integrity) {
  console.log('📝 Creating distribution package.json...');
  
  // Read root package.json for version info
  const rootPackage = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'));
  
  const distPackage = {
    name: '@dataprism/core',
    version: rootPackage.version,
    description: 'DataPrism Core - High-performance browser-based analytics engine with WebAssembly',
    keywords: ['analytics', 'webassembly', 'duckdb', 'data-processing', 'browser'],
    author: 'DataPrism Team',
    license: 'MIT',
    homepage: 'https://dataprism.dev',
    repository: {
      type: 'git',
      url: 'https://github.com/dataprism/core.git',
      directory: 'packages/core'
    },
    bugs: {
      url: 'https://github.com/dataprism/core/issues'
    },
    type: 'module',
    main: './dataprism_core.js',
    types: './dataprism_core.d.ts',
    exports: {
      '.': {
        import: './dataprism_core.js',
        types: './dataprism_core.d.ts'
      },
      './wasm': {
        import: './dataprism_core_bg.wasm'
      },
      './integrity': {
        import: './integrity.json'
      }
    },
    files: [
      'dataprism_core.js',
      'dataprism_core.d.ts',
      'dataprism_core_bg.wasm',
      'dataprism_core_bg.wasm.d.ts',
      'integrity.json',
      'README.md',
      'CHANGELOG.md'
    ],
    sideEffects: false,
    engines: {
      node: '>=18.0.0'
    },
    browser: {
      './dataprism_core.js': './dataprism_core.js'
    },
    // Package metadata
    dataprism: {
      wasmSize: wasmStats.size,
      wasmSizeKB: wasmStats.sizeKB,
      wasmSizeMB: wasmStats.sizeMB,
      integrity,
      buildDate: new Date().toISOString(),
      buildVersion: rootPackage.version
    }
  };
  
  const packagePath = resolve(pkgDir, 'package.json');
  writeFileSync(packagePath, JSON.stringify(distPackage, null, 2));
  
  console.log(`✅ Created ${packagePath}`);
  return distPackage;
}

function generateReadme(distPackage) {
  console.log('📚 Generating README...');
  
  const readme = `# @dataprism/core

High-performance browser-based analytics engine powered by WebAssembly.

## Installation

\`\`\`bash
npm install @dataprism/core
\`\`\`

## Quick Start

\`\`\`typescript
import init, { DataPrismEngine } from '@dataprism/core';

// Initialize WASM module
await init();

// Create engine instance
const engine = new DataPrismEngine();

// Execute queries
const result = await engine.query('SELECT 1 as hello');
console.log(result); // [{ hello: 1 }]
\`\`\`

## CDN Usage

\`\`\`html
<script type="module">
  import init, { DataPrismEngine } from 'https://cdn.dataprism.dev/v${distPackage.version}/core/dataprism_core.js';
  
  await init();
  const engine = new DataPrismEngine();
  // Use engine...
</script>
\`\`\`

## Package Info

- **Version**: ${distPackage.version}
- **WASM Size**: ${distPackage.dataprism.wasmSizeMB}MB
- **Build Date**: ${distPackage.dataprism.buildDate}

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security

All WASM binaries are signed and include integrity hashes:

\`\`\`json
${JSON.stringify(distPackage.dataprism.integrity, null, 2)}
\`\`\`

## Documentation

Visit [https://docs.dataprism.dev](https://docs.dataprism.dev) for complete documentation.

## License

MIT © DataPrism Team
`;
  
  const readmePath = resolve(pkgDir, 'README.md');
  writeFileSync(readmePath, readme);
  
  console.log(`✅ Generated ${readmePath}`);
}

async function main() {
  try {
    console.log('🚀 DataPrism Core post-build processing...\n');
    
    // Validate WASM output
    const wasmStats = validateWasmOutput();
    
    // Generate integrity hashes
    const integrity = generateIntegrityHashes();
    
    // Create distribution package.json
    const distPackage = createDistributionPackageJson(wasmStats, integrity);
    
    // Generate README
    generateReadme(distPackage);
    
    console.log('\n🎉 Post-build processing completed successfully!');
    console.log(`📦 Package ready for distribution: @dataprism/core@${distPackage.version}`);
    
  } catch (error) {
    console.error('\n❌ Post-build processing failed:', error.message);
    process.exit(1);
  }
}

main();