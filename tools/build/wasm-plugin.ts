import { Plugin } from "vite";
import { readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { basename, dirname, join } from "path";
import { gzipSync } from "zlib";

export interface WasmPluginOptions {
  /**
   * Base64 encode WASM files for inline embedding
   */
  inline?: boolean;

  /**
   * Generate integrity hashes for WASM files
   */
  generateIntegrity?: boolean;

  /**
   * Copy WASM files to specific directory
   */
  outDir?: string;

  /**
   * Compression settings for WASM files
   */
  compression?: 'gzip' | 'brotli' | 'both' | 'none';

  /**
   * Enable streaming compilation support
   */
  streamingCompilation?: boolean;

  /**
   * Memory optimization settings
   */
  memoryOptimization?: {
    initialMemory?: number;
    maximumMemory?: number;
    sharedMemory?: boolean;
  };
}

export function wasmPlugin(options: WasmPluginOptions = {}): Plugin {
  const {
    inline = false,
    generateIntegrity = true,
    outDir = "assets",
    compression = 'none',
    streamingCompilation = true,
    memoryOptimization = {
      initialMemory: 16777216, // 16MB
      maximumMemory: 134217728, // 128MB
      sharedMemory: false,
    },
  } = options;

  const wasmFiles = new Map<string, { source: Buffer; hash?: string }>();

  return {
    name: "wasm-loader",

    load(id) {
      if (id.endsWith(".wasm")) {
        if (inline) {
          // Inline WASM as base64
          const wasmBuffer = readFileSync(id);
          const base64 = wasmBuffer.toString("base64");

          return `
            export default function loadWasm() {
              const base64 = '${base64}';
              const binaryString = atob(base64);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              return bytes.buffer;
            }
          `;
        } else {
          // Load WASM as URL with optimizations
          const wasmBuffer = readFileSync(id);
          const fileName = basename(id);

          // Generate integrity hash
          let hash: string | undefined;
          if (generateIntegrity) {
            hash = createHash("sha384").update(wasmBuffer).digest("base64");
          }

          wasmFiles.set(fileName, { source: wasmBuffer, hash });

          return `
            ${generateWasmLoader(fileName, outDir, streamingCompilation, memoryOptimization, hash)}
          `;
        }
      }
    },

    generateBundle(options, bundle) {
      // Copy WASM files to output directory with compression support
      for (const [fileName, { source, hash }] of wasmFiles) {
        // Emit original WASM file
        this.emitFile({
          type: "asset",
          fileName: `${outDir}/${fileName}`,
          source,
        });

        // Generate compressed versions if requested
        if (compression === 'gzip' || compression === 'both') {
          const gzipCompressed = gzipSync(source);
          this.emitFile({
            type: "asset",
            fileName: `${outDir}/${fileName}.gz`,
            source: gzipCompressed,
          });
        }

        // Note: Brotli compression would require additional library
        // For now, we'll prepare the structure but skip actual compression

        // Generate integrity manifest
        if (generateIntegrity && hash) {
          const manifestPath = `${outDir}/integrity.json`;
          let manifest: Record<string, string> = {};

          // Read existing manifest if it exists
          try {
            const existingBundle = bundle[manifestPath];
            if (existingBundle && existingBundle.type === "asset") {
              manifest = JSON.parse(existingBundle.source as string);
            }
          } catch (e) {
            // New manifest
          }

          manifest[fileName] = `sha384-${hash}`;

          this.emitFile({
            type: "asset",
            fileName: manifestPath,
            source: JSON.stringify(manifest, null, 2),
          });
        }
      }
    },

    configureServer(server) {
      // Serve WASM files with correct MIME type in development
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith(".wasm")) {
          res.setHeader("Content-Type", "application/wasm");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cache-Control", "public, max-age=31536000");
        }
        next();
      });
    },
  };
}

function generateWasmLoader(
  fileName: string,
  outDir: string,
  streamingCompilation: boolean,
  memoryOptimization: any,
  hash?: string
): string {
  const integrityCheck = hash ? `export const integrity = 'sha384-${hash}';` : '';
  const wasmUrl = `/${outDir}/${fileName}`;

  return `
    export const wasmUrl = '${wasmUrl}';
    ${integrityCheck}

    export default function loadWasm() {
      ${streamingCompilation ? generateStreamingLoader(wasmUrl, memoryOptimization) : generateBasicLoader(wasmUrl)}
    }

    export function loadWasmStreaming() {
      ${generateStreamingLoader(wasmUrl, memoryOptimization)}
    }

    export function checkWasmSupport() {
      return typeof WebAssembly === 'object' && 
             typeof WebAssembly.instantiate === 'function' &&
             typeof WebAssembly.instantiateStreaming === 'function';
    }

    export function checkStreamingSupport() {
      return typeof WebAssembly.instantiateStreaming === 'function';
    }
  `;
}

function generateStreamingLoader(wasmUrl: string, memoryOptimization: any): string {
  return `
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      // Use streaming compilation for better performance
      return WebAssembly.instantiateStreaming(
        fetch('${wasmUrl}', {
          headers: {
            'Accept': 'application/wasm'
          }
        }),
        {
          env: {
            memory: new WebAssembly.Memory({
              initial: ${Math.floor(memoryOptimization.initialMemory / 65536)},
              maximum: ${Math.floor(memoryOptimization.maximumMemory / 65536)},
              shared: ${memoryOptimization.sharedMemory}
            })
          }
        }
      ).then(result => result.instance);
    } else {
      // Fallback to regular instantiation
      return fetch('${wasmUrl}')
        .then(response => {
          if (!response.ok) {
            throw new Error(\`Failed to load WASM: \${response.statusText}\`);
          }
          return response.arrayBuffer();
        })
        .then(bytes => WebAssembly.instantiate(bytes, {
          env: {
            memory: new WebAssembly.Memory({
              initial: ${Math.floor(memoryOptimization.initialMemory / 65536)},
              maximum: ${Math.floor(memoryOptimization.maximumMemory / 65536)},
              shared: ${memoryOptimization.sharedMemory}
            })
          }
        }))
        .then(result => result.instance);
    }
  `;
}

function generateBasicLoader(wasmUrl: string): string {
  return `
    return fetch('${wasmUrl}')
      .then(response => {
        if (!response.ok) {
          throw new Error(\`Failed to load WASM: \${response.statusText}\`);
        }
        return response.arrayBuffer();
      })
      .then(bytes => WebAssembly.instantiate(bytes))
      .then(result => result.instance);
  `;
}
