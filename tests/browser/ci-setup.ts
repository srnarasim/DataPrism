/**
 * Global setup for CI browser tests
 * Optimized for speed and stability in CI environment
 */

import { chromium, type FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting CI browser test setup...');
  
  // Create necessary directories
  const testResultsDir = join(process.cwd(), 'test-results');
  if (!existsSync(testResultsDir)) {
    mkdirSync(testResultsDir, { recursive: true });
  }
  
  // Pre-warm browser for faster test startup
  console.log('🔧 Pre-warming browser...');
  const browser = await chromium.launch({
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=TranslateUI',
      '--memory-pressure-off',
    ],
  });
  
  // Create a test page to warm up the browser
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to test server to verify it's running
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    // Pre-load WebAssembly support check
    await page.evaluate(() => {
      return typeof WebAssembly !== 'undefined';
    });
    
    console.log('✅ Browser pre-warming complete');
  } catch (error) {
    console.warn('⚠️ Browser pre-warming failed:', error.message);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
  
  // Check if required build artifacts exist
  console.log('🔍 Checking build artifacts...');
  const requiredPaths = [
    'packages/orchestration/dist',
    'cdn/dist',
  ];
  
  for (const path of requiredPaths) {
    if (!existsSync(path)) {
      console.warn(`⚠️ Build artifact missing: ${path}`);
    } else {
      console.log(`✅ Build artifact found: ${path}`);
    }
  }
  
  // Set environment variables for CI optimization
  process.env.BROWSER_TEST_CI = 'true';
  process.env.BROWSER_TEST_QUICK = 'true';
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = 'true';
  
  console.log('✅ CI browser test setup complete');
}

export default globalSetup;