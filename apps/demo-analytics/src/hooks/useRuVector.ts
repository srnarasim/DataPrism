import { useEffect, useRef, useState } from "react";
// @ts-expect-error — @ruvector/wasm has no type declarations yet
import { createVectorDB } from "@ruvector/wasm";

export interface TripSearchResult {
  id: string;
  score: number;
}

export interface TripMeta {
  place: string;
  country: string;
  year: number;
}

export interface UseRuVectorReturn {
  isReady: boolean;
  error: Error | null;
  indexTrips: (
    rowIndices: number[],
    embeddings: number[][],
    meta: TripMeta[],
  ) => Promise<void>;
  search: (queryEmbedding: number[], k: number) => TripSearchResult[];
}

export function useRuVector(): UseRuVectorReturn {
  const dbRef = useRef<any | null>(null);
  const readyPromiseRef = useRef<Promise<void> | null>(null);
  const resolveReadyRef = useRef<() => void>(() => {});
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create a promise that resolves when the DB is ready, so indexTrips can await it.
  if (!readyPromiseRef.current) {
    readyPromiseRef.current = new Promise<void>((resolve) => {
      resolveReadyRef.current = resolve;
    });
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await createVectorDB(384, "cosine", true);
        // VectorDB constructor is synchronous; no separate init() needed.
        if (!cancelled) {
          dbRef.current = db;
          resolveReadyRef.current();
          setIsReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("RuVector WASM init failed:", e);
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function indexTrips(
    rowIndices: number[],
    embeddings: number[][],
    meta: TripMeta[],
  ): Promise<void> {
    // Wait for WASM to finish initializing regardless of when this is called.
    await readyPromiseRef.current;
    if (!dbRef.current) throw new Error("VectorDB not ready");
    const entries = rowIndices.map((idx, i) => ({
      id: String(idx),
      vector: new Float32Array(embeddings[i]),
      metadata: meta[i],
    }));
    dbRef.current.insertBatch(entries);
  }

  function search(queryEmbedding: number[], k: number): TripSearchResult[] {
    if (!dbRef.current) return [];
    const raw = dbRef.current.search(new Float32Array(queryEmbedding), k);
    return raw.map((r: { id: string; score: number }) => ({ id: r.id, score: r.score }));
  }

  return { isReady, error, indexTrips, search };
}
