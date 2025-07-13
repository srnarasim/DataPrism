#!/usr/bin/env node

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Import the CLI main function
import("../dist/index.js")
  .then(({ main }) => {
    main(process.argv.slice(2));
  })
  .catch((error) => {
    console.error("Failed to start DataPrism CLI:", error.message);
    process.exit(1);
  });
