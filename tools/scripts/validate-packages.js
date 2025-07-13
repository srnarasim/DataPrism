#!/usr/bin/env node

/**
 * Package Validation Script for DataPrism Core
 * - Validates package.json files across all packages
 * - Checks dependency versions and compatibility
 * - Ensures consistent package metadata
 * - Validates distribution readiness
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import chalk from "chalk";
import semver from "semver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "../..");

// Required fields for publishable packages
const REQUIRED_FIELDS = [
  "name",
  "version",
  "description",
  "keywords",
  "author",
  "license",
  "repository",
  "bugs",
  "homepage",
];

// Required scripts for DataPrism packages
const REQUIRED_SCRIPTS = {
  core: ["build", "test"],
  orchestration: ["build", "test", "lint"],
  plugins: ["build", "test", "lint"],
  cli: ["build", "test", "lint"],
};

// Version compatibility rules
const VERSION_RULES = {
  "@dataprism/core": "workspace:*",
  "@dataprism/orchestration": "workspace:*",
  "@dataprism/plugin-framework": "workspace:*",
  typescript: "^5.2.0",
  vite: "^5.0.0",
};

function validatePackageJson(packagePath, packageType) {
  const issues = [];
  const warnings = [];

  if (!existsSync(packagePath)) {
    issues.push(`Package.json not found: ${packagePath}`);
    return { issues, warnings, packageJson: null };
  }

  let packageJson;
  try {
    packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  } catch (error) {
    issues.push(`Invalid JSON in ${packagePath}: ${error.message}`);
    return { issues, warnings, packageJson: null };
  }

  // Check required fields
  REQUIRED_FIELDS.forEach((field) => {
    if (!packageJson[field]) {
      issues.push(`Missing required field "${field}" in ${packagePath}`);
    }
  });

  // Validate name format
  if (packageJson.name && !packageJson.name.startsWith("@dataprism/")) {
    warnings.push(
      `Package name "${packageJson.name}" should start with "@dataprism/"`,
    );
  }

  // Validate version
  if (packageJson.version && !semver.valid(packageJson.version)) {
    issues.push(`Invalid version "${packageJson.version}" in ${packagePath}`);
  }

  // Check required scripts
  const requiredScripts = REQUIRED_SCRIPTS[packageType] || [];
  requiredScripts.forEach((script) => {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      warnings.push(`Missing recommended script "${script}" in ${packagePath}`);
    }
  });

  // Validate dependencies
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  };

  Object.entries(VERSION_RULES).forEach(([dep, expectedRange]) => {
    if (allDeps[dep]) {
      const actualVersion = allDeps[dep];
      if (expectedRange === "workspace:*") {
        if (
          actualVersion !== "workspace:*" &&
          !actualVersion.startsWith("^1.")
        ) {
          warnings.push(
            `${dep} should use "workspace:*" or compatible version in ${packagePath}`,
          );
        }
      } else if (!semver.intersects(actualVersion, expectedRange)) {
        warnings.push(
          `${dep} version "${actualVersion}" may not be compatible with expected "${expectedRange}" in ${packagePath}`,
        );
      }
    }
  });

  // Check for common issues
  if (packageJson.main && !packageJson.main.startsWith("./")) {
    warnings.push(`Main field should be relative path in ${packagePath}`);
  }

  if (packageJson.types && !packageJson.types.endsWith(".d.ts")) {
    warnings.push(`Types field should point to .d.ts file in ${packagePath}`);
  }

  // Validate exports field if present
  if (packageJson.exports) {
    if (typeof packageJson.exports !== "object") {
      issues.push(`Exports field must be an object in ${packagePath}`);
    } else {
      const hasDefaultExport = packageJson.exports["."];
      if (!hasDefaultExport) {
        warnings.push(
          `Exports should include default "." export in ${packagePath}`,
        );
      }
    }
  }

  // Check for security issues
  if (packageJson.scripts) {
    Object.entries(packageJson.scripts).forEach(([script, command]) => {
      if (
        typeof command === "string" &&
        command.includes("curl") &&
        command.includes("sh")
      ) {
        issues.push(`Potentially unsafe script "${script}" in ${packagePath}`);
      }
    });
  }

  return { issues, warnings, packageJson };
}

function findPackages() {
  const packages = [];
  const packagesDir = join(rootDir, "packages");

  if (existsSync(packagesDir)) {
    const packageDirs = readdirSync(packagesDir);

    packageDirs.forEach((dir) => {
      const packagePath = join(packagesDir, dir);
      const packageJsonPath = join(packagePath, "package.json");

      if (statSync(packagePath).isDirectory() && existsSync(packageJsonPath)) {
        packages.push({
          name: dir,
          path: packageJsonPath,
          type: dir,
        });
      }
    });
  }

  // Check tools
  const toolsDir = join(rootDir, "tools");
  if (existsSync(toolsDir)) {
    const toolDirs = readdirSync(toolsDir);

    toolDirs.forEach((dir) => {
      const toolPath = join(toolsDir, dir);
      const packageJsonPath = join(toolPath, "package.json");

      if (statSync(toolPath).isDirectory() && existsSync(packageJsonPath)) {
        packages.push({
          name: `tools/${dir}`,
          path: packageJsonPath,
          type: "tools",
        });
      }
    });
  }

  // Check root package
  const rootPackageJson = join(rootDir, "package.json");
  if (existsSync(rootPackageJson)) {
    packages.push({
      name: "root",
      path: rootPackageJson,
      type: "root",
    });
  }

  return packages;
}

function validateWorkspaceDependencies(packages) {
  const issues = [];
  const warnings = [];
  const packageVersions = new Map();

  // Collect package versions
  packages.forEach((pkg) => {
    if (pkg.packageJson && pkg.packageJson.name) {
      packageVersions.set(pkg.packageJson.name, pkg.packageJson.version);
    }
  });

  // Check workspace dependencies
  packages.forEach((pkg) => {
    if (!pkg.packageJson) return;

    const allDeps = {
      ...pkg.packageJson.dependencies,
      ...pkg.packageJson.devDependencies,
      ...pkg.packageJson.peerDependencies,
    };

    Object.entries(allDeps).forEach(([depName, depVersion]) => {
      if (packageVersions.has(depName)) {
        const actualVersion = packageVersions.get(depName);

        if (depVersion === "workspace:*") {
          // This is correct for workspace dependencies
          return;
        }

        if (depVersion.startsWith("^") || depVersion.startsWith("~")) {
          const specifiedVersion = depVersion.slice(1);
          if (!semver.satisfies(actualVersion, depVersion)) {
            warnings.push(
              `Workspace dependency ${depName} version mismatch in ${pkg.name}: specified ${depVersion}, actual ${actualVersion}`,
            );
          }
        }
      }
    });
  });

  return { issues, warnings };
}

function generateCompatibilityMatrix(packages) {
  console.log(chalk.bold("\n📊 Package Compatibility Matrix:"));

  const matrix = new Map();
  const allPackages = packages.filter(
    (p) => p.packageJson && p.packageJson.name,
  );

  allPackages.forEach((pkg) => {
    const deps = pkg.packageJson.dependencies || {};
    const devDeps = pkg.packageJson.devDependencies || {};

    Object.keys({ ...deps, ...devDeps }).forEach((depName) => {
      if (!matrix.has(depName)) {
        matrix.set(depName, new Set());
      }
      matrix.get(depName).add(pkg.packageJson.name);
    });
  });

  // Show common dependencies
  const commonDeps = Array.from(matrix.entries())
    .filter(([_, users]) => users.size > 1)
    .sort((a, b) => b[1].size - a[1].size);

  console.log(chalk.gray("\nMost common dependencies:"));
  commonDeps.slice(0, 10).forEach(([depName, users]) => {
    console.log(
      chalk.gray(`  ${depName.padEnd(30)} used by ${users.size} packages`),
    );
  });
}

function main() {
  console.log(chalk.bold("🔍 DataPrism Package Validation\n"));

  const packages = findPackages();
  console.log(chalk.blue(`Found ${packages.length} packages to validate\n`));

  let totalIssues = 0;
  let totalWarnings = 0;
  const allPackageData = [];

  // Validate each package
  packages.forEach((pkg) => {
    console.log(chalk.cyan(`Validating ${pkg.name}...`));

    const { issues, warnings, packageJson } = validatePackageJson(
      pkg.path,
      pkg.type,
    );
    allPackageData.push({ ...pkg, packageJson, issues, warnings });

    if (issues.length > 0) {
      console.log(chalk.red(`  ❌ ${issues.length} issue(s):`));
      issues.forEach((issue) => console.log(chalk.red(`    • ${issue}`)));
      totalIssues += issues.length;
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow(`  ⚠️  ${warnings.length} warning(s):`));
      warnings.forEach((warning) =>
        console.log(chalk.yellow(`    • ${warning}`)),
      );
      totalWarnings += warnings.length;
    }

    if (issues.length === 0 && warnings.length === 0) {
      console.log(chalk.green("  ✅ Valid"));
    }

    console.log("");
  });

  // Validate workspace dependencies
  console.log(chalk.bold("🔗 Validating workspace dependencies..."));
  const workspaceValidation = validateWorkspaceDependencies(allPackageData);

  if (workspaceValidation.issues.length > 0) {
    console.log(
      chalk.red(
        `  ❌ ${workspaceValidation.issues.length} workspace issue(s):`,
      ),
    );
    workspaceValidation.issues.forEach((issue) =>
      console.log(chalk.red(`    • ${issue}`)),
    );
    totalIssues += workspaceValidation.issues.length;
  }

  if (workspaceValidation.warnings.length > 0) {
    console.log(
      chalk.yellow(
        `  ⚠️  ${workspaceValidation.warnings.length} workspace warning(s):`,
      ),
    );
    workspaceValidation.warnings.forEach((warning) =>
      console.log(chalk.yellow(`    • ${warning}`)),
    );
    totalWarnings += workspaceValidation.warnings.length;
  }

  if (
    workspaceValidation.issues.length === 0 &&
    workspaceValidation.warnings.length === 0
  ) {
    console.log(chalk.green("  ✅ All workspace dependencies valid"));
  }

  // Generate compatibility matrix
  generateCompatibilityMatrix(allPackageData);

  // Summary
  console.log(chalk.bold("\n📋 Validation Summary:"));
  console.log(`  Packages validated: ${packages.length}`);
  console.log(`  Total issues: ${chalk.red(totalIssues)}`);
  console.log(`  Total warnings: ${chalk.yellow(totalWarnings)}`);

  // Recommendations
  if (totalIssues > 0 || totalWarnings > 0) {
    console.log(chalk.bold("\n💡 Recommendations:"));

    if (totalIssues > 0) {
      console.log(chalk.gray("  • Fix all issues before publishing packages"));
      console.log(chalk.gray("  • Run `npm run validate:packages` regularly"));
    }

    if (totalWarnings > 0) {
      console.log(
        chalk.gray(
          "  • Consider addressing warnings for better package quality",
        ),
      );
      console.log(
        chalk.gray("  • Use consistent dependency versions across packages"),
      );
    }
  }

  // Exit with appropriate code
  if (totalIssues > 0) {
    console.log(chalk.red("\n❌ Package validation failed"));
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(chalk.yellow("\n⚠️  Package validation passed with warnings"));
  } else {
    console.log(chalk.green("\n✅ All packages valid!"));
  }
}

main();
