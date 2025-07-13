import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { spawn } from "cross-spawn";
import fs from "fs-extra";
import path from "path";

import { logger } from "../utils/logger.js";

export const validateCommand = new Command("validate")
  .description("Validate DataPrism project configuration and dependencies")
  .option("--fix", "Automatically fix issues when possible")
  .option("--strict", "Use strict validation rules")
  .action(
    async (
      options: {
        fix?: boolean;
        strict?: boolean;
      } = {},
    ) => {
      try {
        const spinner = ora("Validating project...").start();

        // Check if this is a DataPrism project
        const packageJsonPath = path.resolve(process.cwd(), "package.json");
        if (!(await fs.pathExists(packageJsonPath))) {
          throw new Error(
            "package.json not found. Make sure you're in a DataPrism project directory.",
          );
        }

        const packageJson = await fs.readJson(packageJsonPath);
        const issues: string[] = [];
        const warnings: string[] = [];

        // Validate DataPrism dependencies
        const requiredDeps = ["@dataprism/core"];
        const missingDeps = requiredDeps.filter(
          (dep) =>
            !packageJson.dependencies?.[dep] &&
            !packageJson.devDependencies?.[dep],
        );

        if (missingDeps.length > 0) {
          issues.push(
            `Missing required dependencies: ${missingDeps.join(", ")}`,
          );
        }

        // Check for conflicting dependencies
        const conflictingDeps = [
          {
            name: "webpack",
            reason: "Use Vite instead for better WASM support",
          },
          { name: "create-react-app", reason: "Use dataprism init instead" },
        ];

        conflictingDeps.forEach(({ name, reason }) => {
          if (
            packageJson.dependencies?.[name] ||
            packageJson.devDependencies?.[name]
          ) {
            warnings.push(
              `Potentially conflicting dependency ${name}: ${reason}`,
            );
          }
        });

        // Validate Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);
        if (majorVersion < 18) {
          issues.push(
            `Node.js version ${nodeVersion} is not supported. Minimum required: 18.0.0`,
          );
        }

        // Check for TypeScript configuration
        const tsConfigPath = path.resolve(process.cwd(), "tsconfig.json");
        if (!(await fs.pathExists(tsConfigPath))) {
          warnings.push(
            "No tsconfig.json found. TypeScript configuration recommended.",
          );
        }

        // Validate WASM files if they exist
        const wasmFiles = await findWasmFiles(process.cwd());
        for (const wasmFile of wasmFiles) {
          try {
            const wasmBuffer = await fs.readFile(wasmFile);
            const magicNumber = wasmBuffer.slice(0, 4);
            const expectedMagic = Buffer.from([0x00, 0x61, 0x73, 0x6d]);

            if (!magicNumber.equals(expectedMagic)) {
              issues.push(`Invalid WASM file: ${wasmFile}`);
            }
          } catch (error) {
            issues.push(
              `Failed to validate WASM file ${wasmFile}: ${error.message}`,
            );
          }
        }

        // Check build configuration
        const viteConfigExists =
          (await fs.pathExists(
            path.resolve(process.cwd(), "vite.config.ts"),
          )) ||
          (await fs.pathExists(path.resolve(process.cwd(), "vite.config.js")));

        if (!viteConfigExists && !packageJson.scripts?.build) {
          warnings.push(
            "No build configuration found. Consider adding vite.config.ts or build script.",
          );
        }

        spinner.stop();

        // Report results
        console.log("");
        console.log(chalk.bold("Validation Results:"));
        console.log("");

        if (issues.length === 0 && warnings.length === 0) {
          console.log(chalk.green("✅ All validations passed!"));
          console.log("");
          return;
        }

        // Show issues
        if (issues.length > 0) {
          console.log(chalk.red.bold("Issues found:"));
          issues.forEach((issue) => {
            console.log(chalk.red(`  ❌ ${issue}`));
          });
          console.log("");
        }

        // Show warnings
        if (warnings.length > 0) {
          console.log(chalk.yellow.bold("Warnings:"));
          warnings.forEach((warning) => {
            console.log(chalk.yellow(`  ⚠️  ${warning}`));
          });
          console.log("");
        }

        // Auto-fix if requested
        if (options.fix && issues.length > 0) {
          console.log(chalk.blue("Attempting to fix issues..."));

          // Install missing dependencies
          if (missingDeps.length > 0) {
            const installSpinner = ora(
              "Installing missing dependencies...",
            ).start();

            try {
              await new Promise<void>((resolve, reject) => {
                const child = spawn("npm", ["install", ...missingDeps], {
                  stdio: "inherit",
                  cwd: process.cwd(),
                });

                child.on("close", (code) => {
                  if (code !== 0) {
                    reject(
                      new Error(`npm install failed with exit code ${code}`),
                    );
                  } else {
                    resolve();
                  }
                });
              });

              installSpinner.succeed("Dependencies installed");
            } catch (error) {
              installSpinner.fail("Failed to install dependencies");
              throw error;
            }
          }

          console.log(chalk.green("✅ Auto-fix completed"));
        }

        // Exit with error code if issues found
        if (issues.length > 0) {
          console.log(
            chalk.red(`Found ${issues.length} issue(s) that need attention.`),
          );
          if (!options.fix) {
            console.log(
              chalk.gray("Run with --fix to attempt automatic fixes."),
            );
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error("Validation failed:", error.message);
        process.exit(1);
      }
    },
  );

async function findWasmFiles(dir: string): Promise<string[]> {
  const wasmFiles: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules"
      ) {
        wasmFiles.push(...(await findWasmFiles(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith(".wasm")) {
        wasmFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }

  return wasmFiles;
}
