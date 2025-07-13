import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import validatePackageName from "validate-npm-package-name";

import { createPlugin, PluginType } from "../templates/plugin-templates.js";
import { logger } from "../utils/logger.js";

const pluginCreateCommand = new Command("create")
  .description("Create a new DataPrism plugin")
  .argument("[name]", "Plugin name")
  .option(
    "-t, --type <type>",
    "Plugin type (data-processor, visualization, integration, utility)",
  )
  .option("--typescript", "Use TypeScript (default: true)")
  .option("--no-typescript", "Use JavaScript")
  .option("-y, --yes", "Use defaults for all prompts")
  .action(
    async (
      pluginName?: string,
      options: {
        type?: string;
        typescript?: boolean;
        yes?: boolean;
      } = {},
    ) => {
      try {
        // Get plugin name
        if (!pluginName) {
          const namePrompt = await inquirer.prompt([
            {
              type: "input",
              name: "name",
              message: "Plugin name:",
              validate: (input: string) => {
                if (!input.trim()) return "Plugin name is required";
                const validation = validatePackageName(input);
                if (!validation.validForNewPackages) {
                  return (
                    validation.errors?.[0] ||
                    validation.warnings?.[0] ||
                    "Invalid plugin name"
                  );
                }
                return true;
              },
            },
          ]);
          pluginName = namePrompt.name;
        }

        // Validate plugin name
        const nameValidation = validatePackageName(pluginName!);
        if (!nameValidation.validForNewPackages) {
          throw new Error(
            `Invalid plugin name: ${nameValidation.errors?.[0] || nameValidation.warnings?.[0]}`,
          );
        }

        const pluginPath = path.resolve(process.cwd(), "plugins", pluginName!);

        // Check if plugin directory exists
        if (await fs.pathExists(pluginPath)) {
          throw new Error(`Plugin ${pluginName} already exists`);
        }

        // Get plugin type
        let pluginType: PluginType = "data-processor";
        if (!options.type && !options.yes) {
          const typePrompt = await inquirer.prompt([
            {
              type: "list",
              name: "type",
              message: "Select plugin type:",
              choices: [
                {
                  name: "Data Processor - Transform and analyze data",
                  value: "data-processor",
                },
                {
                  name: "Visualization - Create charts and visual components",
                  value: "visualization",
                },
                {
                  name: "Integration - Connect to external services",
                  value: "integration",
                },
                {
                  name: "Utility - Helper functions and tools",
                  value: "utility",
                },
              ],
              default: "data-processor",
            },
          ]);
          pluginType = typePrompt.type;
        } else if (options.type) {
          pluginType = options.type as PluginType;
        }

        // Get TypeScript preference
        const useTypeScript = options.typescript !== false;

        // Create plugin
        const spinner = ora("Creating DataPrism plugin...").start();

        try {
          await createPlugin({
            name: pluginName!,
            path: pluginPath,
            type: pluginType,
            typescript: useTypeScript,
          });

          spinner.succeed("Plugin created successfully");

          // Success message
          console.log("");
          console.log(chalk.green("✨ Plugin created successfully!"));
          console.log("");
          console.log("Next steps:");
          console.log(chalk.gray(`  cd plugins/${pluginName}`));
          console.log(chalk.gray("  npm run build"));
          console.log(chalk.gray("  npm run test"));
          console.log("");
          console.log(
            "Plugin development guide: https://docs.dataprism.dev/plugins",
          );
        } catch (error) {
          spinner.fail("Plugin creation failed");
          throw error;
        }
      } catch (error) {
        logger.error("Failed to create plugin:", error.message);
        process.exit(1);
      }
    },
  );

const pluginListCommand = new Command("list")
  .description("List available plugins")
  .option("-a, --all", "Show all plugins including disabled")
  .action(async (options: { all?: boolean } = {}) => {
    try {
      const pluginsDir = path.resolve(process.cwd(), "plugins");

      if (!(await fs.pathExists(pluginsDir))) {
        logger.info("No plugins directory found");
        return;
      }

      const pluginDirs = await fs.readdir(pluginsDir);
      const plugins = [];

      for (const dir of pluginDirs) {
        const pluginPath = path.join(pluginsDir, dir);
        const packageJsonPath = path.join(pluginPath, "package.json");

        if (await fs.pathExists(packageJsonPath)) {
          try {
            const packageJson = await fs.readJson(packageJsonPath);
            plugins.push({
              name: packageJson.name || dir,
              version: packageJson.version || "0.0.0",
              description: packageJson.description || "No description",
              path: dir,
            });
          } catch {
            // Skip invalid package.json files
          }
        }
      }

      if (plugins.length === 0) {
        logger.info("No plugins found");
        return;
      }

      console.log(chalk.bold("Available Plugins:"));
      console.log("");

      plugins.forEach((plugin) => {
        console.log(
          chalk.cyan(`  ${plugin.name}`) + chalk.gray(` v${plugin.version}`),
        );
        console.log(chalk.gray(`    ${plugin.description}`));
        console.log(chalk.gray(`    Location: plugins/${plugin.path}`));
        console.log("");
      });
    } catch (error) {
      logger.error("Failed to list plugins:", error.message);
      process.exit(1);
    }
  });

export const pluginCommand = new Command("plugin")
  .description("Plugin development tools")
  .addCommand(pluginCreateCommand)
  .addCommand(pluginListCommand);
