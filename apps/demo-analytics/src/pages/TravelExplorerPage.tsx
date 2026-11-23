import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { useDataPrism } from "../contexts/DataPrismContext";
import { embed } from "../utils/embeddings";
import { useRuVector } from "../hooks/useRuVector";
import { SemanticClusteringPlugin } from "@dataprism/plugins-out-of-box";

// ── types ─────────────────────────────────────────────────────────────────────

interface TripRow {
  row_index: number;
  place: string;
  country: string;
  year: string;
  type: string;
  notes: string;
  [key: string]: unknown;
}

interface SearchResult {
  place: string;
  country: string;
  year: string;
  notes: string;
  score: number;
}

// ── validation ────────────────────────────────────────────────────────────────

export function validateCsvColumns(headers: string[]): void {
  if (!headers.includes("notes")) {
    throw new Error("CSV must have a 'notes' column");
  }
}

// ── component ─────────────────────────────────────────────────────────────────

export function TravelExplorerPage() {
  const { loadData, query } = useDataPrism();
  const { isReady: rvReady, indexTrips, search } = useRuVector();

  const [tripsLoaded, setTripsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [embedProgress, setEmbedProgress] = useState(0);
  const [isEmbedding, setIsEmbedding] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [aggregation, setAggregation] = useState<string | null>(null);

  const [numClusters, setNumClusters] = useState(5);
  const [isClustering, setIsClustering] = useState(false);
  const [silhouette, setSilhouette] = useState<number | null>(null);
  const [clusterError, setClusterError] = useState<string | null>(null);
  const clusterContainerRef = useRef<HTMLDivElement>(null);

  const storedEmbeddingsRef = useRef<number[][] | null>(null);
  const storedDatasetRef = useRef<{ columns: { name: string; type: string }[]; rows: unknown[][] } | null>(null);

  // ── load CSV ────────────────────────────────────────────────────────────────

  const onDrop = useCallback(
    async (files: File[]) => {
      setLoadError(null);
      const file = files[0];
      if (!file) return;

      Papa.parse<TripRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          try {
            const headers = result.meta.fields ?? [];
            validateCsvColumns(headers);

            const rows = result.data.map((r, i) => ({ ...r, row_index: i }));
            await loadData(rows, "trips");

            const notes = rows.map((r) => r.notes || "");
            const meta = rows.map((r) => ({
              place: r.place,
              country: r.country,
              year: parseInt(String(r.year), 10),
            }));
            const indices = rows.map((_, i) => i);

            setIsEmbedding(true);
            const embeddings = await embed(notes, ({ progress }) =>
              setEmbedProgress(progress),
            );
            setIsEmbedding(false);
            setEmbedProgress(1);

            await indexTrips(indices, embeddings, meta);

            storedEmbeddingsRef.current = embeddings;
            storedDatasetRef.current = {
              columns: headers.map((h) => ({ name: h, type: "string" })),
              rows: rows.map((r) => headers.map((h) => r[h])),
            };

            setTripsLoaded(true);
          } catch (e) {
            setLoadError(e instanceof Error ? e.message : String(e));
            setIsEmbedding(false);
          }
        },
        error: (err) => setLoadError(err.message),
      });
    },
    [loadData, indexTrips],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  // ── semantic search ──────────────────────────────────────────────────────────

  const handleSearch = async () => {
    setSearchError(null);
    if (!tripsLoaded) {
      setSearchError("Load data first");
      return;
    }
    if (!searchQuery.trim()) return;

    const [queryVec] = await embed([searchQuery]);
    const hits = search(queryVec, 5);
    if (!hits.length) {
      setSearchResults([]);
      return;
    }

    const ids = hits.map((h) => h.id).join(",");
    const scoreMap = Object.fromEntries(hits.map((h) => [h.id, h.score]));

    const rows = await query(
      `SELECT row_index, place, country, year, notes FROM trips WHERE row_index IN (${ids})`,
    );

    setSearchResults(
      (rows.data ?? []).map((r: Record<string, unknown>) => ({
        place: String(r.place ?? ""),
        country: String(r.country ?? ""),
        year: String(r.year ?? ""),
        notes: String(r.notes ?? ""),
        score: scoreMap[String(r.row_index)] ?? 0,
      })),
    );

    const agg = await query(
      `SELECT COUNT(*) as n, COUNT(DISTINCT country) as countries FROM trips WHERE row_index IN (${ids})`,
    );
    if (agg.data?.[0]) {
      setAggregation(`${agg.data[0].n} results across ${agg.data[0].countries} countries`);
    }
  };

  // ── cluster view ─────────────────────────────────────────────────────────────

  const handleCluster = async () => {
    if (!tripsLoaded || !storedEmbeddingsRef.current || !storedDatasetRef.current) return;
    setIsClustering(true);
    setClusterError(null);
    try {
      const plugin = new (SemanticClusteringPlugin as any)();
      const mockContext = {
        logger: { info: console.info, error: console.error, warn: console.warn, debug: console.debug },
        eventBus: { publish: () => {}, subscribe: () => () => {} },
      };
      await plugin.initialize(mockContext);

      const result = await plugin.performClustering(storedDatasetRef.current, {
        algorithm: "kmeans",
        features: [],
        normalize: false,
        numClusters,
        precomputedEmbeddings: storedEmbeddingsRef.current,
      });

      setSilhouette(result.metrics.silhouetteScore);

      if (clusterContainerRef.current) {
        await plugin.render(clusterContainerRef.current, storedDatasetRef.current);
      }
    } catch (e) {
      setClusterError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsClustering(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6" data-testid="travel-page">
      <h1 className="text-3xl font-bold text-gray-900">Rediscover Your Travels</h1>
      <p className="text-gray-500">
        Load a trips CSV, search by feel, and cluster your adventures — all in the browser.
      </p>

      {/* Panel A — Load Data */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Load Your Trips</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-500">
            {isDragActive ? "Drop the CSV here…" : "Drag & drop a trips CSV or click to browse"}
          </p>
        </div>

        <a
          href="/sample-travels.csv"
          download
          className="text-sm text-blue-600 underline"
        >
          Download sample CSV
        </a>

        {isEmbedding && (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Downloading AI model and embedding notes… this takes 1–2 minutes on first load.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.round(embedProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {loadError && (
          <p className="text-sm text-red-600">{loadError}</p>
        )}
        {tripsLoaded && (
          <p className="text-sm text-green-600">Trips loaded and indexed!</p>
        )}
      </section>

      {/* Panel B — Semantic Search */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Semantic Search</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isEmbedding && handleSearch()}
            placeholder="e.g. adventurous mountain hike"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            disabled={isEmbedding}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEmbedding ? "Indexing…" : "Search"}
          </button>
        </div>

        {searchError && (
          <p className="text-sm text-red-600">{searchError}</p>
        )}

        {aggregation && (
          <p className="text-sm text-gray-500">{aggregation}</p>
        )}

        {searchResults.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 font-medium">Place</th>
                  <th className="px-3 py-2 font-medium">Country</th>
                  <th className="px-3 py-2 font-medium">Year</th>
                  <th className="px-3 py-2 font-medium">Notes</th>
                  <th className="px-3 py-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((r, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-medium">{r.place}</td>
                    <td className="px-3 py-2 text-gray-600">{r.country}</td>
                    <td className="px-3 py-2 text-gray-600">{r.year}</td>
                    <td className="px-3 py-2 text-gray-500 max-w-xs truncate">{r.notes}</td>
                    <td className="px-3 py-2 text-blue-600">{r.score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Panel C — Cluster View */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Cluster View</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">
            Clusters:
            <input
              type="range"
              min={2}
              max={8}
              defaultValue={5}
              onMouseUp={(e) => setNumClusters(Number((e.target as HTMLInputElement).value))}
              className="ml-2 w-32"
            />
            <span className="ml-2 font-medium">{numClusters}</span>
          </label>
          <button
            onClick={handleCluster}
            disabled={!tripsLoaded || isClustering}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClustering ? "Clustering…" : "Cluster my trips"}
          </button>
        </div>

        {silhouette !== null && (
          <p className="text-sm text-gray-600">
            Silhouette: <span className="font-mono">{silhouette.toFixed(3)}</span>
          </p>
        )}

        {clusterError && (
          <p className="text-sm text-red-600">{clusterError}</p>
        )}

        <div
          ref={clusterContainerRef}
          className="relative w-full"
          style={{ minHeight: 400 }}
        />
      </section>
    </div>
  );
}

export default TravelExplorerPage;
