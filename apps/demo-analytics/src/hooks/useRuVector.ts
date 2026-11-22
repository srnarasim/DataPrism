import { useEffect, useRef, useState } from "react";
// @ts-expect-error — @ruvector/wasm has no type declarations yet
import { VectorDB } from "@ruvector/wasm";

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
  const dbRef = useRef<InstanceType<typeof VectorDB> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = new VectorDB({ dimensions: 384, metric: "cosine", useHnsw: true });
        await db.init();
        if (!cancelled) {
          dbRef.current = db;
          setIsReady(true);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
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
