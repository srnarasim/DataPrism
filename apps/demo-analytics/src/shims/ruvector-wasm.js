// Static import of the wasm-pack web-target bundle.
// Vite processes ruvector_wasm_bg.wasm as an asset and rewrites the URL.
import init, { VectorDB as _VectorDB } from "../wasm/ruvector/ruvector_wasm.js";
import wasmUrl from "../wasm/ruvector/ruvector_wasm_bg.wasm?url";

let _ready = false;
let _initPromise = null;

function ensureLoaded() {
  if (_ready) return Promise.resolve();
  if (!_initPromise) {
    _initPromise = init({ module_or_path: wasmUrl }).then(() => {
      _ready = true;
    });
  }
  return _initPromise;
}

export class VectorDB {
  constructor(config) {
    this._config = config;
    this._db = null;
  }

  async init() {
    await ensureLoaded();
    this._db = new _VectorDB(this._config);
    await this._db.init();
  }

  insertBatch(entries) {
    return this._db.insertBatch(entries);
  }

  search(vec, k) {
    return this._db.search(vec, k);
  }
}
