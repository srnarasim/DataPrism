// Build-time shim for @ruvector/wasm.
// In tests: vite.config.ts test.alias points here to the mock stub instead.
// In production build: this shim loads the pre-built WASM from /ruvector/ in public/.

let _VectorDB = null;
let _initPromise = null;

async function ensureLoaded() {
  if (_VectorDB) return;
  if (!_initPromise) {
    _initPromise = (async () => {
      const base = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
      const jsUrl = base.replace(/\/$/, "") + "/ruvector/ruvector_wasm.js";
      const wasmUrl = base.replace(/\/$/, "") + "/ruvector/ruvector_wasm_bg.wasm";
      const mod = await import(/* @vite-ignore */ jsUrl);
      await mod.default({ module_or_path: wasmUrl });
      _VectorDB = mod.VectorDB;
    })();
  }
  await _initPromise;
}

export class VectorDB {
  _config;
  _db = null;

  constructor(config) {
    this._config = config;
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
