import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';

import { logger } from '../utils/logger.js';

export const buildCommand = new Command('build')
  .description('Build DataPrism project')
  .option('-p, --production', 'Build for production')
  .option('-w, --watch', 'Watch for changes')
  .option('--analyze', 'Analyze bundle size')
  .option('--target <target>', 'Build target (web, node, all)', 'web')
  .action(async (options: {
    production?: boolean;
    watch?: boolean;
    analyze?: boolean;
    target?: string;
  } = {}) => {
    try {
      const spinner = ora('Building project...').start();

      // Check if this is a DataPrism project
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (!(await fs.pathExists(packageJsonPath))) {
        throw new Error('package.json not found. Make sure you\'re in a DataPrism project directory.');
      }

      const packageJson = await fs.readJson(packageJsonPath);
      const isDataPrismProject = packageJson.dependencies?.['@dataprism/core'] || 
                                packageJson.devDependencies?.['@dataprism/core'] ||
                                packageJson.name?.includes('dataprism');

      if (!isDataPrismProject) {
        logger.warn('This doesn\'t appear to be a DataPrism project. Continuing anyway...');
      }

      // Determine build command
      let buildScript = 'build';
      if (options.production) {
        buildScript = 'build:production';
      } else if (options.watch) {
        buildScript = 'build:watch';
      }

      // Check if script exists in package.json
      if (!packageJson.scripts?.[buildScript]) {
        // Fallback to default build
        buildScript = 'build';
        if (!packageJson.scripts?.[buildScript]) {
          throw new Error(`No build script found in package.json. Add a "build" script to package.json.`);
        }
      }

      // Set environment variables
      const env = { ...process.env };
      if (options.production) {
        env.NODE_ENV = 'production';
      }
      if (options.analyze) {
        env.ANALYZE = 'true';
      }

      spinner.text = `Running ${buildScript}...`;

      // Run build command
      await new Promise<void>((resolve, reject) => {
        const child = spawn('npm', ['run', buildScript], {
          stdio: 'inherit',
          env,
          cwd: process.cwd()
        });

        child.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Build failed with exit code ${code}`));
          } else {
            resolve();
          }
        });
      });

      spinner.succeed('Build completed successfully');

      // Show build output info
      const distPath = path.resolve(process.cwd(), 'dist');
      if (await fs.pathExists(distPath)) {
        const stats = await fs.stat(distPath);
        console.log('');
        console.log(chalk.green('Build output:'));
        console.log(chalk.gray(`  Location: ${distPath}`));
        console.log(chalk.gray(`  Generated: ${stats.mtime.toLocaleString()}`));

        // Show file sizes if analyze flag is set
        if (options.analyze) {
          const files = await fs.readdir(distPath);
          console.log('');
          console.log(chalk.bold('Bundle Analysis:'));
          
          for (const file of files) {
            const filePath = path.join(distPath, file);
            const fileStat = await fs.stat(filePath);
            if (fileStat.isFile()) {
              const sizeKB = Math.round(fileStat.size / 1024);
              const sizeMB = (sizeKB / 1024).toFixed(2);
              console.log(chalk.gray(`  ${file}: ${sizeKB}KB (${sizeMB}MB)`));
            }
          }
        }
      }

      console.log('');
      console.log(chalk.green('✨ Build completed successfully!'));

    } catch (error) {
      logger.error('Build failed:', error.message);
      process.exit(1);
    }
  });