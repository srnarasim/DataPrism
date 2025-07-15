import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

const sourceDir = resolve(projectRoot, 'packages/plugins/out-of-box/dist');
const targetDir = resolve(projectRoot, 'cdn/dist');

// Ensure target directory exists
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

// Copy the browser build to CDN
const sourceFile = resolve(sourceDir, 'browser.js');
const sourceMap = resolve(sourceDir, 'browser.js.map');
const targetFile = resolve(targetDir, 'dataprism-plugins.min.js');
const targetMap = resolve(targetDir, 'dataprism-plugins.min.js.map');

try {
  if (existsSync(sourceFile)) {
    copyFileSync(sourceFile, targetFile);
    console.log('✅ Copied dataprism-plugins.min.js to CDN');
  } else {
    console.error('❌ Source file not found:', sourceFile);
  }
  
  if (existsSync(sourceMap)) {
    copyFileSync(sourceMap, targetMap);
    console.log('✅ Copied dataprism-plugins.min.js.map to CDN');
  } else {
    console.warn('⚠️  Source map not found:', sourceMap);
  }
  
  // Copy workers if they exist
  const workersSourceDir = resolve(sourceDir, 'workers');
  const workersTargetDir = resolve(targetDir, 'workers');
  
  if (existsSync(workersSourceDir)) {
    if (!existsSync(workersTargetDir)) {
      mkdirSync(workersTargetDir, { recursive: true });
    }
    
    const workerFiles = ['clustering-worker.js', 'csv-parser-worker.js'];
    workerFiles.forEach(file => {
      const srcFile = resolve(workersSourceDir, file);
      const destFile = resolve(workersTargetDir, file);
      if (existsSync(srcFile)) {
        copyFileSync(srcFile, destFile);
        console.log(`✅ Copied ${file} to CDN workers`);
      }
    });
  }
  
  console.log('🎉 Out-of-box plugins successfully copied to CDN!');
} catch (error) {
  console.error('❌ Error copying plugins to CDN:', error);
  process.exit(1);
}