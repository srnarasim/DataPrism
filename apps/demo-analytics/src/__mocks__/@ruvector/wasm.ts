class MockVectorDB {
  insertBatch(_entries: unknown[]) { return []; }
  search(_vec: Float32Array, _k: number) { return []; }
}

export async function createVectorDB(_dimensions: number, _metric: string, _useHnsw: boolean) {
  return new MockVectorDB();
}

export const VectorDB = MockVectorDB;
