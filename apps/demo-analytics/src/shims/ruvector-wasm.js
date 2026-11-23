// Static import of the wasm-pack web-target bundle.
// Vite processes ruvector_wasm_bg.wasm as an asset and rewrites the URL.
import init, { VectorDB as _VectorDB } from "../wasm/ruvector/ruvector_wasm.js";
import wasmUrl from "../wasm/ruvector/ruvector_wasm_bg.wasm?url";

// Start loading the WASM eagerly on module import.
const _initPromise = init({ module_or_path: wasmUrl });

// Await WASM readiness before constructing a VectorDB.
export async function createVectorDB(dimensions, metric, useHnsw) {
  await _initPromise;
  return new _VectorDB(dimensions, metric, useHnsw);
}

// Re-export for type-compatible usage in tests (mock replaces this whole module).
export { _VectorDB as VectorDB };
