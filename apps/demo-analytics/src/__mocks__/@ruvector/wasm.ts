export class VectorDB {
  init() { return Promise.resolve(); }
  insertBatch(_entries: unknown[]) { return []; }
  search(_vec: Float32Array, _k: number) { return []; }
}
