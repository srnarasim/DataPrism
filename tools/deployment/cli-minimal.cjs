#!/usr/bin/env node

/**
 * Minimal CDN Deployment CLI for GitHub Actions
 * This is a simplified version that works without complex dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const [, , command, ...args] = process.argv;

function log(message) {
  console.log(`[DataPrism Deploy] ${message}`);
}

function error(message) {
  console.error(`[DataPrism Deploy] ERROR: ${message}`);
  process.exit(1);
}

function generatePluginManifest(options = {}) {
  log('Generating plugin manifest...');
  
  const manifest = {
    plugins: [],
    categories: [
      {
        id: 'integration',
        name: 'Integration',
        description: 'Data integration and import plugins',
        plugins: []
      },
      {
        id: 'processing', 
        name: 'Processing',
        description: 'Data processing and transformation plugins',
        plugins: []
      },
      {
        id: 'visualization',
        name: 'Visualization', 
        description: 'Data visualization and charting plugins',
        plugins: []
      },
      {
        id: 'utility',
        name: 'Utility',
        description: 'Utility and helper plugins', 
        plugins: []
      }
    ],
    compatibility: {
      chrome: '90+',
      firefox: '88+',
      safari: '14+',
      edge: '90+',
      webAssembly: true,
      es2020: true
    },
    baseUrl: options.baseUrl || '',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };

  // Discover plugins in packages/plugins if it exists
  const pluginsDir = path.resolve('packages/plugins');
  if (fs.existsSync(pluginsDir)) {
    try {
      const entries = fs.readdirSync(pluginsDir);
      
      entries.forEach(entry => {
        const entryPath = path.join(pluginsDir, entry);
        const stats = fs.statSync(entryPath);
        
        if (stats.isDirectory()) {
          const packageJsonPath = path.join(entryPath, 'package.json');
          if (fs.existsSync(packageJsonPath)) {
            try {
              const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
              
              // Basic plugin entry
              const plugin = {
                id: packageJson.name.toLowerCase().replace(/[@/]/g, '').replace(/[^a-z0-9]/g, '-'),
                name: packageJson.name,
                version: packageJson.version || '1.0.0',
                entry: `plugins/${entry}/index.js`,
                dependencies: [],
                metadata: {
                  description: packageJson.description || 'DataPrism plugin',
                  author: packageJson.author || 'DataPrism Team',
                  license: packageJson.license || 'MIT',
                  keywords: packageJson.keywords || [],
                  size: 0,
                  loadOrder: 50,
                  lazy: true
                },
                integrity: '',
                category: 'utility',
                exports: ['default']
              };
              
              manifest.plugins.push(plugin);
              
              // Add to utility category
              const utilityCategory = manifest.categories.find(c => c.id === 'utility');
              if (utilityCategory) {
                utilityCategory.plugins.push(plugin.id);
              }
              
              log(`  Found plugin: ${plugin.name}`);
            } catch (e) {
              // Skip invalid package.json
            }
          }
        }
      });
    } catch (e) {
      log('Warning: Could not scan plugins directory');
    }
  }

  // Ensure output directory exists
  const outputPath = options.output || 'cdn/dist/plugins/manifest.json';
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write manifest
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  
  log(`✅ Plugin manifest generated: ${outputPath}`);
  log(`📦 Found ${manifest.plugins.length} plugins`);
  
  return manifest;
}

function deployToGitHubPages(options = {}) {
  log('Deploying to GitHub Pages...');
  
  const assetsDir = options.assetsDir || 'cdn/dist';
  
  if (!fs.existsSync(assetsDir)) {
    error(`Assets directory not found: ${assetsDir}`);
  }

  try {
    // Configure git
    if (process.env.GIT_USERNAME) {
      execSync(`git config user.name "${process.env.GIT_USERNAME}"`, { stdio: 'inherit' });
    }
    if (process.env.GIT_EMAIL) {
      execSync(`git config user.email "${process.env.GIT_EMAIL}"`, { stdio: 'inherit' });
    }

    // Create or checkout gh-pages branch
    const branch = options.branch || 'gh-pages';
    
    try {
      execSync(`git checkout ${branch}`, { stdio: 'pipe' });
      log(`Switched to existing ${branch} branch`);
    } catch (e) {
      // Branch doesn't exist, create it
      execSync(`git checkout --orphan ${branch}`, { stdio: 'inherit' });
      log(`Created new ${branch} branch`);
    }

    // Clear existing content (except .git)
    execSync('find . -maxdepth 1 -not -name .git -not -name . -exec rm -rf {} \\;', { stdio: 'inherit' });

    // Copy CDN assets
    execSync(`cp -r ${assetsDir}/* .`, { stdio: 'inherit' });

    // Add all files
    execSync('git add .', { stdio: 'inherit' });

    // Check if there are changes to commit
    try {
      execSync('git diff --cached --exit-code', { stdio: 'pipe' });
      log('No changes to deploy');
      return { success: true, url: `https://${options.repository.split('/')[0]}.github.io/${options.repository.split('/')[1]}` };
    } catch (e) {
      // There are changes, proceed with commit
    }

    // Commit changes
    const commitMessage = `Deploy CDN assets - ${new Date().toISOString()}

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>`;

    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

    // Push to GitHub Pages
    execSync(`git push origin ${branch} --force`, { stdio: 'inherit' });

    const url = `https://${options.repository.split('/')[0]}.github.io/${options.repository.split('/')[1]}`;
    log(`✅ Deployed to GitHub Pages: ${url}`);

    return { success: true, url };
  } catch (e) {
    error(`Deployment failed: ${e.message}`);
  }
}

function validateDeployment(url, options = {}) {
  log(`Validating deployment: ${url}`);
  
  // Basic validation - check if URL is accessible
  try {
    const { execSync } = require('child_process');
    const timeout = options.timeout || 30000;
    
    // Check main URL with timeout
    try {
      execSync(`curl -f -s --max-time 10 "${url}" > /dev/null`, { stdio: 'pipe' });
      log('✅ Main URL accessible');
    } catch (e) {
      log('❌ Main URL not accessible');
      return { success: false, error: 'Main URL not accessible' };
    }
    
    // Check manifest
    try {
      execSync(`curl -f -s --max-time 5 "${url}/manifest.json" > /dev/null`, { stdio: 'pipe' });
      log('✅ Manifest accessible');
    } catch (e) {
      log('⚠️ Manifest not accessible');
    }
    
    // Check core bundle
    try {
      execSync(`curl -f -s --max-time 5 "${url}/dataprism.min.js" > /dev/null`, { stdio: 'pipe' });
      log('✅ Core bundle accessible');
    } catch (e) {
      log('⚠️ Core bundle not accessible');
    }
    
    // Check plugin manifest
    try {
      execSync(`curl -f -s --max-time 5 "${url}/plugins/manifest.json" > /dev/null`, { stdio: 'pipe' });
      log('✅ Plugin manifest accessible');
    } catch (e) {
      log('⚠️ Plugin manifest not accessible');
    }
    
    log('✅ Basic validation passed');
    return { success: true };
  } catch (e) {
    error(`Validation failed: ${e.message}`);
  }
}

// Parse arguments
function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    if (key.startsWith('--')) {
      const optionName = key.slice(2);
      if (optionName === 'no-validate') {
        options.validate = false;
        i -= 1; // This is a flag, not a key-value pair
      } else {
        options[optionName] = value;
      }
    }
  }
  return options;
}

// Main command handling
switch (command) {
  case 'generate-manifest':
    const manifestOptions = parseArgs(args);
    generatePluginManifest(manifestOptions);
    break;
    
  case 'deploy':
    const deployOptions = parseArgs(args);
    const result = deployToGitHubPages(deployOptions);
    
    if (deployOptions.validate !== false) {
      setTimeout(() => {
        validateDeployment(result.url);
      }, 5000); // Wait 5 seconds for deployment to propagate
    }
    break;
    
  case 'validate':
    const [url] = args;
    const validateOptions = parseArgs(args.slice(1));
    validateDeployment(url, validateOptions);
    break;
    
  default:
    console.log(`DataPrism CDN Deployment CLI

Usage:
  node cli-minimal.js generate-manifest [options]
  node cli-minimal.js deploy [options]
  node cli-minimal.js validate <url> [options]

Options:
  --output <file>           Output file for manifest
  --base-url <url>          Base URL for assets
  --target <provider>       Deployment target
  --repository <repo>       GitHub repository (owner/repo)
  --environment <env>       Environment
  --no-validate            Skip validation
`);
    break;
}