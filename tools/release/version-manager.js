#!/usr/bin/env node

/**
 * Version Manager for DataPrism Core
 * - Bump versions across all packages
 * - Maintain version consistency
 * - Generate changelog entries
 * - Prepare releases
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";
import chalk from "chalk";
import semver from "semver";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "../..");

class VersionManager {
  constructor() {
    this.packages = this.findPackages();
    this.currentVersion = this.getCurrentVersion();
  }

  findPackages() {
    const packages = [];

    // Add root package
    const rootPackageJson = join(rootDir, "package.json");
    if (existsSync(rootPackageJson)) {
      packages.push({
        name: "root",
        path: rootPackageJson,
        type: "root",
      });
    }

    // Add workspace packages
    const packagesDir = join(rootDir, "packages");
    if (existsSync(packagesDir)) {
      const packageDirs = readdirSync(packagesDir);

      packageDirs.forEach((dir) => {
        const packagePath = join(packagesDir, dir);
        const packageJsonPath = join(packagePath, "package.json");

        if (
          statSync(packagePath).isDirectory() &&
          existsSync(packageJsonPath)
        ) {
          packages.push({
            name: dir,
            path: packageJsonPath,
            type: "package",
          });
        }
      });
    }

    return packages;
  }

  getCurrentVersion() {
    const rootPackageJson = JSON.parse(
      readFileSync(join(rootDir, "package.json"), "utf8"),
    );
    return rootPackageJson.version;
  }

  async selectVersionBump() {
    const choices = [
      {
        name: `Patch (${this.currentVersion} → ${semver.inc(this.currentVersion, "patch")})`,
        value: "patch",
      },
      {
        name: `Minor (${this.currentVersion} → ${semver.inc(this.currentVersion, "minor")})`,
        value: "minor",
      },
      {
        name: `Major (${this.currentVersion} → ${semver.inc(this.currentVersion, "major")})`,
        value: "major",
      },
      {
        name: "Pre-release",
        value: "prerelease",
      },
      {
        name: "Custom version",
        value: "custom",
      },
    ];

    const { bumpType } = await inquirer.prompt([
      {
        type: "list",
        name: "bumpType",
        message: "Select version bump type:",
        choices,
      },
    ]);

    if (bumpType === "custom") {
      const { customVersion } = await inquirer.prompt([
        {
          type: "input",
          name: "customVersion",
          message: "Enter custom version:",
          validate: (input) => {
            if (!semver.valid(input)) {
              return "Please enter a valid semantic version";
            }
            if (!semver.gt(input, this.currentVersion)) {
              return `Version must be greater than current version (${this.currentVersion})`;
            }
            return true;
          },
        },
      ]);
      return customVersion;
    } else if (bumpType === "prerelease") {
      const { prereleaseId } = await inquirer.prompt([
        {
          type: "input",
          name: "prereleaseId",
          message: "Enter prerelease identifier (alpha, beta, rc):",
          default: "alpha",
          validate: (input) => {
            if (!/^[a-z]+$/.test(input)) {
              return "Prerelease identifier must contain only lowercase letters";
            }
            return true;
          },
        },
      ]);
      return semver.inc(this.currentVersion, "prerelease", prereleaseId);
    } else {
      return semver.inc(this.currentVersion, bumpType);
    }
  }

  updatePackageVersion(packagePath, newVersion) {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    packageJson.version = newVersion;

    // Update workspace dependencies
    ["dependencies", "devDependencies", "peerDependencies"].forEach(
      (depType) => {
        if (packageJson[depType]) {
          Object.keys(packageJson[depType]).forEach((depName) => {
            if (depName.startsWith("@dataprism/")) {
              const currentDepVersion = packageJson[depType][depName];
              if (
                currentDepVersion === "workspace:*" ||
                currentDepVersion.startsWith("^")
              ) {
                packageJson[depType][depName] = `^${newVersion}`;
              }
            }
          });
        }
      },
    );

    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
    return packageJson;
  }

  generateChangelog(newVersion, changes = []) {
    const date = new Date().toISOString().split("T")[0];
    const changelogPath = join(rootDir, "CHANGELOG.md");

    let changelog = "";
    if (existsSync(changelogPath)) {
      changelog = readFileSync(changelogPath, "utf8");
    } else {
      changelog =
        "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n";
    }

    const newEntry = `## [${newVersion}] - ${date}\n\n`;

    if (changes.length > 0) {
      const sections = {
        Added: changes.filter((c) => c.type === "feat"),
        Changed: changes.filter((c) => c.type === "change"),
        Deprecated: changes.filter((c) => c.type === "deprecate"),
        Removed: changes.filter((c) => c.type === "remove"),
        Fixed: changes.filter((c) => c.type === "fix"),
        Security: changes.filter((c) => c.type === "security"),
      };

      let entryContent = "";
      Object.entries(sections).forEach(([section, sectionChanges]) => {
        if (sectionChanges.length > 0) {
          entryContent += `### ${section}\n\n`;
          sectionChanges.forEach((change) => {
            entryContent += `- ${change.description}\n`;
          });
          entryContent += "\n";
        }
      });

      if (entryContent) {
        const fullEntry = newEntry + entryContent;
        changelog = changelog.replace(
          "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n",
          `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${fullEntry}`,
        );
      }
    } else {
      // Auto-generate from git commits
      try {
        const commits = execSync(
          `git log --oneline --pretty=format:"%s" ${this.currentVersion}..HEAD`,
          {
            encoding: "utf8",
            cwd: rootDir,
          },
        )
          .trim()
          .split("\n")
          .filter(Boolean);

        if (commits.length > 0) {
          let entryContent = "### Changed\n\n";
          commits.forEach((commit) => {
            entryContent += `- ${commit}\n`;
          });
          entryContent += "\n";

          const fullEntry = newEntry + entryContent;
          changelog = changelog.replace(
            "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n",
            `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${fullEntry}`,
          );
        }
      } catch (error) {
        console.warn(
          chalk.yellow("Could not generate changelog from git commits"),
        );
        const fullEntry = newEntry + "### Changed\n\n- Version bump\n\n";
        changelog = changelog.replace(
          "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n",
          `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${fullEntry}`,
        );
      }
    }

    writeFileSync(changelogPath, changelog);
    return changelogPath;
  }

  async commitVersionChanges(newVersion) {
    try {
      // Add all package.json changes
      execSync(
        "git add package.json packages/*/package.json tools/*/package.json CHANGELOG.md",
        {
          cwd: rootDir,
        },
      );

      // Commit changes
      execSync(
        `git commit -m "chore: bump version to ${newVersion}

🤖 Generated with DataPrism Version Manager

Co-Authored-By: Claude <noreply@anthropic.com>"`,
        {
          cwd: rootDir,
        },
      );

      // Create git tag
      execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, {
        cwd: rootDir,
      });

      console.log(
        chalk.green(
          `✅ Committed version changes and created tag v${newVersion}`,
        ),
      );
    } catch (error) {
      console.error(
        chalk.red("Failed to commit version changes:"),
        error.message,
      );
      throw error;
    }
  }

  async run() {
    console.log(chalk.bold("🏷️  DataPrism Version Manager\n"));
    console.log(chalk.blue(`Current version: ${this.currentVersion}`));
    console.log(chalk.blue(`Found ${this.packages.length} packages\n`));

    // Check git status
    try {
      const gitStatus = execSync("git status --porcelain", {
        encoding: "utf8",
        cwd: rootDir,
      }).trim();

      if (gitStatus) {
        console.log(chalk.yellow("⚠️  Working directory is not clean:"));
        console.log(gitStatus);

        const { proceed } = await inquirer.prompt([
          {
            type: "confirm",
            name: "proceed",
            message: "Continue with uncommitted changes?",
            default: false,
          },
        ]);

        if (!proceed) {
          console.log(chalk.gray("Version bump cancelled"));
          process.exit(0);
        }
      }
    } catch (error) {
      console.warn(chalk.yellow("Could not check git status"));
    }

    // Select new version
    const newVersion = await this.selectVersionBump();
    console.log(chalk.green(`\nNew version: ${newVersion}`));

    // Confirm changes
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Update all packages to version ${newVersion}?`,
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray("Version bump cancelled"));
      process.exit(0);
    }

    // Update all packages
    console.log(chalk.blue("\nUpdating package versions..."));

    this.packages.forEach((pkg) => {
      console.log(chalk.gray(`  Updating ${pkg.name}...`));
      this.updatePackageVersion(pkg.path, newVersion);
    });

    // Generate changelog
    console.log(chalk.blue("\nGenerating changelog..."));
    const changelogPath = this.generateChangelog(newVersion);
    console.log(chalk.gray(`  Updated ${changelogPath}`));

    // Commit changes
    const { commitChanges } = await inquirer.prompt([
      {
        type: "confirm",
        name: "commitChanges",
        message: "Commit version changes and create git tag?",
        default: true,
      },
    ]);

    if (commitChanges) {
      await this.commitVersionChanges(newVersion);
    }

    console.log(chalk.green("\n🎉 Version bump completed!"));
    console.log(chalk.gray("\nNext steps:"));
    console.log(chalk.gray("  1. Review the changes"));
    console.log(chalk.gray("  2. Run tests: npm run test"));
    console.log(chalk.gray("  3. Build packages: npm run build"));
    console.log(chalk.gray("  4. Publish: npm run publish:packages"));
  }
}

// Main execution
async function main() {
  const versionManager = new VersionManager();
  await versionManager.run();
}

main().catch((error) => {
  console.error(chalk.red("Version manager failed:"), error.message);
  process.exit(1);
});
