import { BaseDeploymentProvider } from './base-provider.js';
import {
  AssetBundle,
  DeploymentConfig,
  DeploymentResult,
  ValidationResult,
  DeploymentStatus,
  DeploymentInfo,
  RollbackOptions,
  CDNProviderOptions,
  ValidationCheck,
  PerformanceMetrics,
} from '../types.js';
import { execSync, spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { promisify } from 'util';

const execAsync = promisify(require('child_process').exec);

export interface GitHubPagesOptions extends CDNProviderOptions {
  repository: string;
  branch?: string;
  token?: string;
  username?: string;
  email?: string;
  customDomain?: string;
  cname?: boolean;
}

export class GitHubPagesProvider extends BaseDeploymentProvider {
  name = 'github-pages';
  supportedTargets = ['github-pages'];

  private ghOptions: GitHubPagesOptions;

  constructor(options: GitHubPagesOptions) {
    super(options);
    this.ghOptions = {
      branch: 'gh-pages',
      cname: true,
      ...options,
    };

    if (!this.ghOptions.repository) {
      throw new Error('GitHub repository is required for GitHub Pages deployment');
    }
  }

  async deploy(assets: AssetBundle, config: DeploymentConfig): Promise<DeploymentResult> {
    const deploymentId = this.generateDeploymentId();
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      this.logger.info('Starting GitHub Pages deployment', { deploymentId, repository: this.ghOptions.repository });
      
      // Run pre-deployment hooks
      if (this.options.hooks?.beforeDeploy) {
        await this.options.hooks.beforeDeploy(assets, config);
      }

      logs.push('Validating deployment configuration...');
      await this.validateConfig(config);

      logs.push('Preparing deployment directory...');
      const deployDir = await this.prepareDeploymentDirectory(assets, config);

      logs.push('Configuring GitHub Pages...');
      await this.configureGitHubPages(deployDir, config);

      logs.push('Deploying to GitHub Pages...');
      const deploymentUrl = await this.deployToGitHubPages(deployDir, deploymentId);

      logs.push('Cleaning up temporary files...');
      this.cleanupDeploymentDirectory(deployDir);

      const deployTime = Date.now() - startTime;
      const result: DeploymentResult = {
        success: true,
        deploymentId,
        url: deploymentUrl,
        logs,
        metrics: {
          buildTime: 0, // Build happens separately
          deployTime,
          totalFiles: assets.files.length,
          totalSize: assets.totalSize,
          compressionRatio: this.calculateCompressionRatio(assets),
        },
      };

      // Run post-deployment hooks
      if (this.options.hooks?.afterDeploy) {
        await this.options.hooks.afterDeploy(result, config);
      }

      this.logger.info('GitHub Pages deployment completed successfully', { deploymentId, url: deploymentUrl });
      return result;

    } catch (error) {
      logs.push(`Deployment failed: ${error.message}`);
      
      const result: DeploymentResult = {
        success: false,
        deploymentId,
        url: '',
        logs,
        error: error.message,
      };

      // Run error hooks
      if (this.options.hooks?.onError) {
        await this.options.hooks.onError(error, config);
      }

      this.logger.error('GitHub Pages deployment failed', { deploymentId, error: error.message });
      return result;
    }
  }

  async validate(url: string, config: DeploymentConfig): Promise<ValidationResult> {
    this.logger.info('Validating GitHub Pages deployment', { url });

    const checks: ValidationCheck[] = [];
    let performance: PerformanceMetrics | undefined;

    try {
      // Run common validations
      const commonChecks = await this.runCommonValidations(url, config);
      checks.push(...commonChecks);

      // GitHub Pages specific validations
      checks.push(await this.validateGitHubPagesSpecific(url));

      // Measure performance
      performance = await this.measurePerformance(url);

      // Validate asset integrity
      checks.push(await this.validateAssetIntegrity(url));

      const success = checks.every(check => check.status !== 'failed');

      return {
        success,
        checks,
        performance,
      };

    } catch (error) {
      checks.push({
        name: 'validation-error',
        status: 'failed',
        message: `Validation failed: ${error.message}`,
      });

      return {
        success: false,
        checks,
        performance,
      };
    }
  }

  async rollback(deploymentId: string, options: RollbackOptions): Promise<DeploymentResult> {
    this.logger.info('Rolling back GitHub Pages deployment', { deploymentId });

    try {
      // For GitHub Pages, rollback means reverting to a previous commit
      const previousCommit = await this.findPreviousDeploymentCommit(deploymentId);
      
      if (!previousCommit) {
        throw new Error(`Cannot find previous deployment to rollback from ${deploymentId}`);
      }

      // Reset to previous commit
      await this.resetToCommit(previousCommit);

      return {
        success: true,
        deploymentId: `rollback_${deploymentId}`,
        url: this.getDeploymentUrl(),
        logs: [
          `Rolled back to commit: ${previousCommit}`,
          'GitHub Pages will rebuild automatically',
        ],
      };

    } catch (error) {
      return {
        success: false,
        deploymentId: `rollback_${deploymentId}`,
        url: '',
        logs: [`Rollback failed: ${error.message}`],
        error: error.message,
      };
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    // GitHub Pages deployments are handled by GitHub's build system
    // We can check the repository's Pages deployment status via API
    try {
      const status = await this.checkGitHubPagesStatus();
      
      return {
        id: deploymentId,
        status: status.status,
        progress: status.progress,
        logs: status.logs,
        url: status.url,
        createdAt: status.createdAt,
        completedAt: status.completedAt,
      };
    } catch (error) {
      return {
        id: deploymentId,
        status: 'error',
        progress: 0,
        logs: [`Failed to get status: ${error.message}`],
        createdAt: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async listDeployments(limit: number = 10): Promise<DeploymentInfo[]> {
    try {
      // Get recent commits from gh-pages branch
      const commits = await this.getRecentCommits(limit);
      
      return commits.map(commit => ({
        id: commit.sha,
        status: 'ready' as const,
        url: this.getDeploymentUrl(),
        branch: this.ghOptions.branch!,
        commitHash: commit.sha,
        createdAt: commit.date,
      }));
    } catch (error) {
      this.logger.error('Failed to list deployments', error);
      return [];
    }
  }

  async cleanup(retentionDays: number): Promise<void> {
    this.logger.info('Cleaning up old GitHub Pages deployments', { retentionDays });
    
    // For GitHub Pages, cleanup involves removing old commits from gh-pages branch
    // This is generally not recommended as it breaks git history
    // We'll just log that cleanup is not applicable
    this.logger.info('GitHub Pages cleanup not implemented - use git history management instead');
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test git connectivity and authentication
      const repoUrl = `https://github.com/${this.ghOptions.repository}.git`;
      const testCommand = `git ls-remote ${repoUrl}`;
      
      execSync(testCommand, { stdio: 'pipe' });
      return true;
    } catch (error) {
      this.logger.error('GitHub connection test failed', error);
      return false;
    }
  }

  private async validateConfig(config: DeploymentConfig): Promise<void> {
    if (!this.ghOptions.repository) {
      throw new Error('GitHub repository is required');
    }

    if (!this.ghOptions.token && !process.env.GITHUB_TOKEN) {
      throw new Error('GitHub token is required (set GITHUB_TOKEN environment variable)');
    }

    // Validate repository access
    const hasAccess = await this.testConnection();
    if (!hasAccess) {
      throw new Error('Cannot access GitHub repository - check token and repository name');
    }
  }

  private async prepareDeploymentDirectory(assets: AssetBundle, config: DeploymentConfig): Promise<string> {
    const tempDir = join(process.cwd(), '.deploy-temp', this.generateDeploymentId());
    
    // Create deployment directory
    mkdirSync(tempDir, { recursive: true });

    // Copy all assets to deployment directory
    for (const file of assets.files) {
      const filePath = join(tempDir, file.path);
      const fileDir = dirname(filePath);
      
      mkdirSync(fileDir, { recursive: true });
      
      if (typeof file.content === 'string') {
        writeFileSync(filePath, file.content, 'utf8');
      } else {
        writeFileSync(filePath, file.content);
      }
    }

    // Write manifest
    writeFileSync(
      join(tempDir, 'manifest.json'),
      JSON.stringify(assets.manifest, null, 2)
    );

    return tempDir;
  }

  private async configureGitHubPages(deployDir: string, config: DeploymentConfig): Promise<void> {
    // Create .nojekyll file to disable Jekyll processing
    writeFileSync(join(deployDir, '.nojekyll'), '');

    // Create CNAME file for custom domain
    if (this.ghOptions.customDomain && this.ghOptions.cname) {
      writeFileSync(join(deployDir, 'CNAME'), this.ghOptions.customDomain);
    }

    // Create README for GitHub Pages
    const readme = `# DataPrism CDN Distribution

This branch contains the CDN-optimized builds of DataPrism Core.

## Deployment Info
- Deployed: ${new Date().toISOString()}
- Environment: ${config.environment}
- Branch: ${config.branch || 'main'}

## Usage

\`\`\`html
<script type="module">
  import { DataPrismEngine } from "${this.getDeploymentUrl()}/core.min.js";
  
  const engine = new DataPrismEngine();
  await engine.initialize();
\`\`\`

## Files

- \`core.min.js\` - Main DataPrism engine
- \`orchestration.min.js\` - High-level orchestration APIs  
- \`plugin-framework.min.js\` - Plugin system
- \`assets/\` - WebAssembly binaries and other assets
- \`manifest.json\` - Asset manifest with integrity hashes

Generated by DataPrism CDN deployment system.
`;

    writeFileSync(join(deployDir, 'README.md'), readme);

    // Create _headers file for Netlify-style headers (GitHub Pages will ignore this)
    const headers = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin

*.wasm
  Content-Type: application/wasm
  Cache-Control: public, max-age=31536000, immutable

*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable

manifest.json
  Content-Type: application/json
  Cache-Control: public, max-age=3600`;

    writeFileSync(join(deployDir, '_headers'), headers);
  }

  private async deployToGitHubPages(deployDir: string, deploymentId: string): Promise<string> {
    const branch = this.ghOptions.branch!;
    const repository = this.ghOptions.repository;
    const token = this.ghOptions.token || process.env.GITHUB_TOKEN;

    // Initialize git repository
    execSync('git init', { cwd: deployDir });
    execSync('git checkout -b ' + branch, { cwd: deployDir });

    // Configure git user
    if (this.ghOptions.username) {
      execSync(`git config user.name "${this.ghOptions.username}"`, { cwd: deployDir });
    }
    if (this.ghOptions.email) {
      execSync(`git config user.email "${this.ghOptions.email}"`, { cwd: deployDir });
    }

    // Add all files
    execSync('git add .', { cwd: deployDir });

    // Commit
    const commitMessage = `Deploy ${deploymentId}\n\nDeployed: ${new Date().toISOString()}\nDeployment ID: ${deploymentId}`;
    execSync(`git commit -m "${commitMessage}"`, { cwd: deployDir });

    // Add remote and push
    const repoUrl = token 
      ? `https://${token}@github.com/${repository}.git`
      : `https://github.com/${repository}.git`;

    execSync(`git remote add origin ${repoUrl}`, { cwd: deployDir });
    execSync(`git push --force origin ${branch}`, { cwd: deployDir });

    return this.getDeploymentUrl();
  }

  private cleanupDeploymentDirectory(deployDir: string): void {
    try {
      rmSync(deployDir, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn('Failed to cleanup deployment directory', error);
    }
  }

  private getDeploymentUrl(): string {
    const [owner, repo] = this.ghOptions.repository.split('/');
    
    if (this.ghOptions.customDomain) {
      return `https://${this.ghOptions.customDomain}`;
    }
    
    return `https://${owner}.github.io/${repo}`;
  }

  private calculateCompressionRatio(assets: AssetBundle): number {
    const totalSize = assets.files.reduce((sum, file) => sum + file.size, 0);
    // Estimate compressed size (GitHub Pages uses gzip)
    const estimatedCompressed = totalSize * 0.7;
    return estimatedCompressed / totalSize;
  }

  private async validateGitHubPagesSpecific(url: string): Promise<ValidationCheck> {
    try {
      // Check if .nojekyll exists
      const nojekyllResponse = await fetch(new URL('/.nojekyll', url).toString());
      
      return {
        name: 'github-pages-config',
        status: nojekyllResponse.ok ? 'passed' : 'warning',
        message: nojekyllResponse.ok
          ? 'GitHub Pages is properly configured (.nojekyll found)'
          : '.nojekyll file not found - Jekyll processing may interfere',
      };
    } catch (error) {
      return {
        name: 'github-pages-config',
        status: 'failed',
        message: `GitHub Pages validation failed: ${error.message}`,
      };
    }
  }

  private async validateAssetIntegrity(url: string): Promise<ValidationCheck> {
    try {
      // Fetch and validate manifest
      const manifestResponse = await fetch(new URL('/manifest.json', url).toString());
      
      if (!manifestResponse.ok) {
        return {
          name: 'asset-integrity',
          status: 'warning',
          message: 'Asset manifest not found',
        };
      }

      const manifest = await manifestResponse.json();
      
      // Validate a few key assets
      const coreAsset = manifest.assets?.core;
      if (coreAsset) {
        const assetResponse = await fetch(new URL(`/${coreAsset.filename}`, url).toString());
        const assetOk = assetResponse.ok;
        
        return {
          name: 'asset-integrity',
          status: assetOk ? 'passed' : 'failed',
          message: assetOk 
            ? 'Core assets are accessible and manifest is valid'
            : 'Core assets not accessible or manifest is invalid',
        };
      }

      return {
        name: 'asset-integrity',
        status: 'passed',
        message: 'Asset manifest is valid',
      };
    } catch (error) {
      return {
        name: 'asset-integrity',
        status: 'failed',
        message: `Asset integrity validation failed: ${error.message}`,
      };
    }
  }

  private async checkGitHubPagesStatus(): Promise<any> {
    // This would integrate with GitHub API to check Pages deployment status
    // For now, return a mock status
    return {
      status: 'ready' as const,
      progress: 100,
      logs: ['Deployment completed'],
      url: this.getDeploymentUrl(),
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  private async findPreviousDeploymentCommit(deploymentId: string): Promise<string | null> {
    // Implementation would find the commit before the specified deployment
    // For now, return null to indicate rollback is not available
    return null;
  }

  private async resetToCommit(commit: string): Promise<void> {
    // Implementation would reset the gh-pages branch to the specified commit
    throw new Error('Rollback not implemented for GitHub Pages');
  }

  private async getRecentCommits(limit: number): Promise<any[]> {
    // This would get recent commits from the gh-pages branch
    // For now, return empty array
    return [];
  }
}