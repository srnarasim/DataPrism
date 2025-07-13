import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';

import { logger } from '../utils/logger.js';

export const serveCommand = new Command('serve')
  .description('Serve DataPrism project for development')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-h, --host <host>', 'Host address', 'localhost')
  .option('--open', 'Open browser automatically')
  .option('--https', 'Use HTTPS')
  .action(async (options: {
    port?: string;
    host?: string;
    open?: boolean;
    https?: boolean;
  } = {}) => {
    try {
      const spinner = ora('Starting development server...').start();

      // Check if this is a DataPrism project
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (!(await fs.pathExists(packageJsonPath))) {
        throw new Error('package.json not found. Make sure you\'re in a DataPrism project directory.');
      }

      const packageJson = await fs.readJson(packageJsonPath);

      // Check for dev script
      const devScript = packageJson.scripts?.dev || packageJson.scripts?.serve || packageJson.scripts?.start;
      if (!devScript) {
        throw new Error('No dev script found in package.json. Add a "dev", "serve", or "start" script.');
      }

      // Set environment variables
      const env = { ...process.env };
      env.PORT = options.port || '3000';
      env.HOST = options.host || 'localhost';
      
      if (options.https) {
        env.HTTPS = 'true';
      }
      if (options.open) {
        env.OPEN = 'true';
      }

      spinner.succeed('Starting development server...');

      // Get script name
      let scriptName = 'dev';
      if (!packageJson.scripts?.dev) {
        scriptName = packageJson.scripts?.serve ? 'serve' : 'start';
      }

      console.log('');
      console.log(chalk.blue('Starting DataPrism development server...'));
      console.log(chalk.gray(`Host: ${options.host || 'localhost'}`));
      console.log(chalk.gray(`Port: ${options.port || '3000'}`));
      console.log(chalk.gray(`HTTPS: ${options.https ? 'enabled' : 'disabled'}`));
      console.log('');

      // Run dev server
      const child = spawn('npm', ['run', scriptName], {
        stdio: 'inherit',
        env,
        cwd: process.cwd()
      });

      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\n');
        console.log(chalk.yellow('Stopping development server...'));
        child.kill('SIGINT');
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        child.kill('SIGTERM');
        process.exit(0);
      });

      child.on('close', (code) => {
        if (code !== 0) {
          logger.error(`Development server exited with code ${code}`);
          process.exit(code || 1);
        }
      });

    } catch (error) {
      logger.error('Failed to start development server:', error.message);
      process.exit(1);
    }
  });