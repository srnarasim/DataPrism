import { Plugin } from 'vite';
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { basename, dirname, join } from 'path';

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
}

export function wasmPlugin(options: WasmPluginOptions = {}): Plugin {
  const {
    inline = false,
    generateIntegrity = true,
    outDir = 'assets'
  } = options;

  const wasmFiles = new Map<string, { source: Buffer; hash?: string }>();

  return {
    name: 'wasm-loader',
    
    load(id) {
      if (id.endsWith('.wasm')) {
        if (inline) {
          // Inline WASM as base64
          const wasmBuffer = readFileSync(id);
          const base64 = wasmBuffer.toString('base64');
          
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
          // Load WASM as URL
          const wasmBuffer = readFileSync(id);
          const fileName = basename(id);
          
          // Generate integrity hash
          let hash: string | undefined;
          if (generateIntegrity) {
            hash = createHash('sha384').update(wasmBuffer).digest('base64');
          }
          
          wasmFiles.set(fileName, { source: wasmBuffer, hash });
          
          return `
            export default function loadWasm() {
              return fetch('/${outDir}/${fileName}')
                .then(response => {
                  if (!response.ok) {
                    throw new Error(\`Failed to load WASM: \${response.statusText}\`);
                  }
                  return response.arrayBuffer();
                });
            }
            
            export const wasmUrl = '/${outDir}/${fileName}';
            ${hash ? `export const integrity = 'sha384-${hash}';` : ''}
          `;
        }
      }
    },

    generateBundle(options, bundle) {
      // Copy WASM files to output directory
      for (const [fileName, { source, hash }] of wasmFiles) {
        this.emitFile({
          type: 'asset',
          fileName: `${outDir}/${fileName}`,
          source
        });
        
        // Generate integrity manifest
        if (generateIntegrity && hash) {
          const manifestPath = `${outDir}/integrity.json`;
          let manifest: Record<string, string> = {};
          
          // Read existing manifest if it exists
          try {
            const existingBundle = bundle[manifestPath];
            if (existingBundle && existingBundle.type === 'asset') {
              manifest = JSON.parse(existingBundle.source as string);
            }
          } catch (e) {
            // New manifest
          }
          
          manifest[fileName] = `sha384-${hash}`;
          
          this.emitFile({
            type: 'asset',
            fileName: manifestPath,
            source: JSON.stringify(manifest, null, 2)
          });
        }
      }
    },

    configureServer(server) {
      // Serve WASM files with correct MIME type in development
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        }
        next();
      });
    }
  };
}