import { FullConfig } from '@playwright/test';

/**
 * Global teardown for Playwright tests
 * Performs cleanup after all tests complete
 */

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global test cleanup...');
  
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    // Generate test summary report
    const testResultsDir = path.join(process.cwd(), 'test-results');
    const summaryPath = path.join(testResultsDir, 'test-summary.json');
    
    const summary = {
      timestamp: new Date().toISOString(),
      testRun: {
        configFile: config.configFile,
        projects: config.projects.map(p => ({
          name: p.name,
          testDir: p.testDir,
          outputDir: p.outputDir
        })),
        globalSetup: config.globalSetup,
        globalTeardown: config.globalTeardown
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        ci: !!process.env.CI
      }
    };
    
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log('✅ Test summary report generated');
    
    // Clean up temporary test data (but preserve results)
    const tempDataPattern = /^temp-.*$/;
    try {
      const files = await fs.readdir(testResultsDir);
      const tempFiles = files.filter(file => tempDataPattern.test(file));
      
      for (const file of tempFiles) {
        const filePath = path.join(testResultsDir, file);
        await fs.unlink(filePath);
      }
      
      if (tempFiles.length > 0) {
        console.log(`✅ Cleaned up ${tempFiles.length} temporary files`);
      }
    } catch (error) {
      console.log('ℹ️  No temporary files to clean up');
    }
    
    // Log final statistics if available
    try {
      const resultsJsonPath = path.join(testResultsDir, 'browser-test-results.json');
      const resultsData = await fs.readFile(resultsJsonPath, 'utf-8');
      const results = JSON.parse(resultsData);
      
      if (results && results.stats) {
        console.log('📊 Test Results Summary:');
        console.log(`   Total tests: ${results.stats.total || 0}`);
        console.log(`   Passed: ${results.stats.passed || 0}`);
        console.log(`   Failed: ${results.stats.failed || 0}`);
        console.log(`   Skipped: ${results.stats.skipped || 0}`);
        console.log(`   Duration: ${results.stats.duration ? Math.round(results.stats.duration / 1000) : 0}s`);
      }
    } catch (error) {
      console.log('ℹ️  Test results summary not available');
    }
    
  } catch (error) {
    console.error('⚠️  Error during global teardown:', error);
    // Don't fail the entire test run due to teardown issues
  }
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;