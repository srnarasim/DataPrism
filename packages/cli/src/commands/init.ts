import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'cross-spawn';
import validatePackageName from 'validate-npm-package-name';

import { ProjectTemplate, createProject } from '../templates/index.js';
import { logger } from '../utils/logger.js';

export const initCommand = new Command('init')
  .description('Initialize a new DataPrism project')
  .argument('[name]', 'Project name')
  .option('-t, --template <template>', 'Project template (analytics-dashboard, data-processor, plugin-starter)')
  .option('--typescript', 'Use TypeScript (default: true)')
  .option('--no-typescript', 'Use JavaScript')
  .option('--skip-install', 'Skip npm install')
  .option('-y, --yes', 'Use defaults for all prompts')
  .action(async (projectName?: string, options: {
    template?: string;
    typescript?: boolean;
    skipInstall?: boolean;
    yes?: boolean;
  } = {}) => {
    try {
      // Get project name
      if (!projectName) {
        const namePrompt = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Project name:',
            validate: (input: string) => {
              if (!input.trim()) return 'Project name is required';
              const validation = validatePackageName(input);
              if (!validation.validForNewPackages) {
                return validation.errors?.[0] || validation.warnings?.[0] || 'Invalid package name';
              }
              return true;
            }
          }
        ]);
        projectName = namePrompt.name;
      }

      // Validate project name
      const nameValidation = validatePackageName(projectName!);
      if (!nameValidation.validForNewPackages) {
        throw new Error(`Invalid project name: ${nameValidation.errors?.[0] || nameValidation.warnings?.[0]}`);
      }

      const projectPath = path.resolve(process.cwd(), projectName!);

      // Check if directory exists
      if (await fs.pathExists(projectPath)) {
        const overwrite = options.yes || (await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Directory ${projectName} already exists. Overwrite?`,
            default: false
          }
        ])).overwrite;

        if (!overwrite) {
          logger.info('Project creation cancelled');
          return;
        }

        await fs.remove(projectPath);
      }

      // Get template preference
      let template: ProjectTemplate = 'analytics-dashboard';
      if (!options.template && !options.yes) {
        const templatePrompt = await inquirer.prompt([
          {
            type: 'list',
            name: 'template',
            message: 'Select a project template:',
            choices: [
              {
                name: 'Analytics Dashboard - Complete analytics application with visualizations',
                value: 'analytics-dashboard'
              },
              {
                name: 'Data Processor - Data processing and transformation focused',
                value: 'data-processor'
              },
              {
                name: 'Plugin Starter - Custom plugin development template',
                value: 'plugin-starter'
              }
            ],
            default: 'analytics-dashboard'
          }
        ]);
        template = templatePrompt.template;
      } else if (options.template) {
        template = options.template as ProjectTemplate;
      }

      // Get TypeScript preference
      const useTypeScript = options.typescript !== false; // Default to true unless --no-typescript

      // Create project
      const spinner = ora('Creating DataPrism project...').start();

      try {
        await createProject({
          name: projectName!,
          path: projectPath,
          template,
          typescript: useTypeScript
        });

        spinner.succeed('Project files created');

        // Install dependencies
        if (!options.skipInstall) {
          spinner.start('Installing dependencies...');
          
          await new Promise<void>((resolve, reject) => {
            const child = spawn('npm', ['install'], {
              cwd: projectPath,
              stdio: 'inherit'
            });

            child.on('close', (code) => {
              if (code !== 0) {
                reject(new Error(`npm install failed with exit code ${code}`));
              } else {
                resolve();
              }
            });
          });

          spinner.succeed('Dependencies installed');
        }

        // Success message
        console.log('');
        console.log(chalk.green('✨ Project created successfully!'));
        console.log('');
        console.log('Next steps:');
        console.log(chalk.gray(`  cd ${projectName}`));
        if (options.skipInstall) {
          console.log(chalk.gray('  npm install'));
        }
        console.log(chalk.gray('  npm run dev'));
        console.log('');
        console.log('Documentation: https://docs.dataprism.dev');

      } catch (error) {
        spinner.fail('Project creation failed');
        throw error;
      }

    } catch (error) {
      logger.error('Failed to create project:', error.message);
      process.exit(1);
    }
  });