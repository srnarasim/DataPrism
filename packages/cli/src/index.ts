import { Command } from "commander";
import chalk from "chalk";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Import commands
import { initCommand } from "./commands/init.js";
import { pluginCommand } from "./commands/plugin.js";
import { buildCommand } from "./commands/build.js";
import { serveCommand } from "./commands/serve.js";
import { validateCommand } from "./commands/validate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load package.json for version info
const packagePath = join(__dirname, "../package.json");
const packageJson = require(packagePath);

export async function main(args: string[]) {
  const program = new Command();

  program
    .name("dataprism")
    .description(
      "DataPrism Core CLI - Build high-performance browser analytics applications",
    )
    .version(packageJson.version)
    .option("-v, --verbose", "Enable verbose logging")
    .option("--no-color", "Disable colored output")
    .hook("preAction", (thisCommand) => {
      // Set up global options
      if (thisCommand.opts().noColor) {
        chalk.level = 0;
      }
    });

  // Add commands
  program.addCommand(initCommand);
  program.addCommand(pluginCommand);
  program.addCommand(buildCommand);
  program.addCommand(serveCommand);
  program.addCommand(validateCommand);

  // Custom help
  program.on("--help", () => {
    console.log("");
    console.log(chalk.gray("Examples:"));
    console.log(chalk.gray("  $ dataprism init my-analytics-app"));
    console.log(chalk.gray("  $ dataprism plugin create data-processor"));
    console.log(chalk.gray("  $ dataprism build --production"));
    console.log(chalk.gray("  $ dataprism serve --port 3000"));
    console.log("");
    console.log(
      chalk.gray("For more information, visit: https://docs.dataprism.dev"),
    );
  });

  try {
    await program.parseAsync(args, { from: "user" });
  } catch (error) {
    console.error(chalk.red("Error:"), error.message);
    process.exit(1);
  }
}
