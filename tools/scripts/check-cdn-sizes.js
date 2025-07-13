#!/usr/bin/env node

/**
 * CDN Bundle Size Checker for DataPrism Core
 * - Validates CDN bundle sizes against limits
 * - Generates size reports
 * - Ensures performance targets are met
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cdnDir = resolve(__dirname, "../../cdn/dist");

// Size limits for CDN bundles (in bytes)
const SIZE_LIMITS = {
  "core.min.js": 2 * 1024 * 1024, // 2MB for core bundle
  "plugin-framework.min.js": 500 * 1024, // 500KB for plugin framework
  "orchestration.min.js": 800 * 1024, // 800KB for orchestration
  "*.wasm": 1.5 * 1024 * 1024, // 1.5MB for WASM files
  total: 5 * 1024 * 1024, // 5MB total CDN size limit
};

function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function checkFileSize(filePath, fileName, size) {
  const issues = [];
  const warnings = [];

  // Check specific file limits
  if (SIZE_LIMITS[fileName]) {
    const limit = SIZE_LIMITS[fileName];
    if (size > limit) {
      issues.push({
        type: "size_exceeded",
        file: fileName,
        size: formatFileSize(size),
        limit: formatFileSize(limit),
        overage: formatFileSize(size - limit),
      });
    } else if (size > limit * 0.9) {
      warnings.push({
        type: "size_warning",
        file: fileName,
        size: formatFileSize(size),
        limit: formatFileSize(limit),
        percentage: Math.round((size / limit) * 100),
      });
    }
  }

  // Check WASM file limits
  if (extname(fileName) === ".wasm") {
    const wasmLimit = SIZE_LIMITS["*.wasm"];
    if (size > wasmLimit) {
      issues.push({
        type: "wasm_size_exceeded",
        file: fileName,
        size: formatFileSize(size),
        limit: formatFileSize(wasmLimit),
        overage: formatFileSize(size - wasmLimit),
      });
    }
  }

  return { issues, warnings };
}

function analyzeBundles() {
  console.log(chalk.bold("📊 CDN Bundle Size Analysis\n"));

  if (!existsSync(cdnDir)) {
    console.error(chalk.red("❌ CDN directory not found:"), cdnDir);
    console.log(chalk.gray("Run `npm run build:cdn` to generate CDN bundles"));
    process.exit(1);
  }

  const files = [];
  let totalSize = 0;
  const allIssues = [];
  const allWarnings = [];

  // Scan CDN directory
  function scanDirectory(dir, relativePath = "") {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relativeFilePath = join(relativePath, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        scanDirectory(fullPath, relativeFilePath);
      } else if (stats.isFile()) {
        const size = stats.size;
        totalSize += size;

        const fileInfo = {
          name: entry,
          path: relativeFilePath,
          size,
          formattedSize: formatFileSize(size),
        };

        files.push(fileInfo);

        // Check individual file sizes
        const { issues, warnings } = checkFileSize(fullPath, entry, size);
        allIssues.push(...issues);
        allWarnings.push(...warnings);
      }
    }
  }

  scanDirectory(cdnDir);

  // Check total size
  if (totalSize > SIZE_LIMITS.total) {
    allIssues.push({
      type: "total_size_exceeded",
      size: formatFileSize(totalSize),
      limit: formatFileSize(SIZE_LIMITS.total),
      overage: formatFileSize(totalSize - SIZE_LIMITS.total),
    });
  }

  // Sort files by size (largest first)
  files.sort((a, b) => b.size - a.size);

  // Display results
  console.log(chalk.bold("📦 Bundle Files:"));
  files.forEach((file) => {
    const sizeColor =
      file.size > 1024 * 1024
        ? chalk.red
        : file.size > 512 * 1024
          ? chalk.yellow
          : chalk.green;
    console.log(
      `  ${chalk.cyan(file.path.padEnd(30))} ${sizeColor(file.formattedSize.padStart(8))}`,
    );
  });

  console.log("");
  console.log(chalk.bold("📊 Summary:"));
  console.log(`  Total files: ${files.length}`);
  console.log(`  Total size: ${formatFileSize(totalSize)}`);
  console.log(`  Size limit: ${formatFileSize(SIZE_LIMITS.total)}`);
  console.log(`  Remaining: ${formatFileSize(SIZE_LIMITS.total - totalSize)}`);

  // Display warnings
  if (allWarnings.length > 0) {
    console.log("");
    console.log(chalk.yellow.bold("⚠️  Warnings:"));
    allWarnings.forEach((warning) => {
      switch (warning.type) {
        case "size_warning":
          console.log(
            chalk.yellow(
              `  ${warning.file} is ${warning.percentage}% of its size limit (${warning.size}/${warning.limit})`,
            ),
          );
          break;
      }
    });
  }

  // Display issues
  if (allIssues.length > 0) {
    console.log("");
    console.log(chalk.red.bold("❌ Issues:"));
    allIssues.forEach((issue) => {
      switch (issue.type) {
        case "size_exceeded":
          console.log(
            chalk.red(
              `  ${issue.file} exceeds size limit by ${issue.overage} (${issue.size}/${issue.limit})`,
            ),
          );
          break;
        case "wasm_size_exceeded":
          console.log(
            chalk.red(
              `  WASM file ${issue.file} exceeds limit by ${issue.overage} (${issue.size}/${issue.limit})`,
            ),
          );
          break;
        case "total_size_exceeded":
          console.log(
            chalk.red(
              `  Total CDN size exceeds limit by ${issue.overage} (${issue.size}/${issue.limit})`,
            ),
          );
          break;
      }
    });
  }

  // Performance recommendations
  console.log("");
  console.log(chalk.bold("🚀 Performance Recommendations:"));

  const largeFiles = files.filter((f) => f.size > 1024 * 1024);
  if (largeFiles.length > 0) {
    console.log(
      chalk.gray("  • Consider code splitting for files larger than 1MB:"),
    );
    largeFiles.forEach((file) => {
      console.log(chalk.gray(`    - ${file.name} (${file.formattedSize})`));
    });
  }

  const jsFiles = files.filter((f) => extname(f.name) === ".js");
  if (jsFiles.some((f) => f.size > 500 * 1024)) {
    console.log(chalk.gray("  • Enable gzip compression on your CDN"));
    console.log(chalk.gray("  • Consider tree shaking to remove unused code"));
  }

  const wasmFiles = files.filter((f) => extname(f.name) === ".wasm");
  if (wasmFiles.length > 0) {
    console.log(
      chalk.gray("  • WASM files should be served with streaming compilation"),
    );
    console.log(chalk.gray("  • Enable WASM compression (brotli recommended)"));
  }

  // Exit with appropriate code
  if (allIssues.length > 0) {
    console.log("");
    console.log(
      chalk.red(`❌ CDN size check failed with ${allIssues.length} issue(s)`),
    );
    process.exit(1);
  } else if (allWarnings.length > 0) {
    console.log("");
    console.log(
      chalk.yellow(
        `⚠️  CDN size check passed with ${allWarnings.length} warning(s)`,
      ),
    );
  } else {
    console.log("");
    console.log(chalk.green("✅ All CDN size checks passed!"));
  }
}

// Generate detailed report if requested
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    limits: SIZE_LIMITS,
    bundles: [],
    totalSize: 0,
    issues: [],
    warnings: [],
  };

  // Implementation would go here
  console.log("📄 Detailed report generation not yet implemented");
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.includes("--report")) {
    generateReport();
  } else {
    analyzeBundles();
  }
}

main();
