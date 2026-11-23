import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { useDataPrism } from "../contexts/DataPrismContext";
import { embed } from "../utils/embeddings";
import { useRuVector } from "../hooks/useRuVector";

// ── types ─────────────────────────────────────────────────────────────────────

interface TripRow {
  row_index: number;
  [key: string]: unknown;
}

interface SearchResult {
  row_index: number;
  score: number;
  [key: string]: unknown;
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
  const [columnNames, setColumnNames] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [aggregation, setAggregation] = useState<string | null>(null);

  const [numClusters, setNumClusters] = useState(5);
  const [isClustering, setIsClustering] = useState(false);
  const [silhouette, setSilhouette] = useState<number | null>(null);
  const [clusterError, setClusterError] = useState<string | null>(null);
  const [clusterPoints, setClusterPoints] = useState<{ x: number; y: number; cluster: number; label: string }[]>([]);

  const storedEmbeddingsRef = useRef<number[][] | null>(null);
  const storedRowsRef = useRef<TripRow[]>([]);

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
            setColumnNames(headers);
            storedRowsRef.current = rows;

            const notes = rows.map((r) => String(r.notes ?? ""));
            const indices = rows.map((_, i) => i);
            const meta = rows.map((r) => ({
              place: String(r.place ?? r.destination ?? r.location ?? ""),
              country: String(r.country ?? ""),
              year: parseInt(String(r.year ?? r.date ?? "0"), 10),
            }));

            setIsEmbedding(true);
            const embeddings = await embed(notes, ({ progress }) =>
              setEmbedProgress(progress),
            );
            setIsEmbedding(false);
            setEmbedProgress(1);

            await indexTrips(indices, embeddings, meta);

            storedEmbeddingsRef.current = embeddings;
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
      `SELECT * FROM trips WHERE row_index IN (${ids})`,
    );

    setSearchResults(
      (rows.data ?? []).map((r: Record<string, unknown>) => ({
        ...r,
        row_index: Number(r.row_index),
        score: scoreMap[String(r.row_index)] ?? 0,
      })),
    );

    // Count distinct values for a summary — use first string-ish column that isn't notes
    const locationCol = columnNames.find(
      (c) => c !== "notes" && c !== "row_index",
    );
    if (locationCol) {
      const agg = await query(
        `SELECT COUNT(*) as n FROM trips WHERE row_index IN (${ids})`,
      );
      if (agg.data?.[0]) {
        setAggregation(`${agg.data[0].n} results`);
      }
    }
  };

  // ── inline clustering ─────────────────────────────────────────────────────────

  const handleCluster = async () => {
    if (!tripsLoaded || !storedEmbeddingsRef.current) return;
    setIsClustering(true);
    setClusterError(null);
    setSilhouette(null);
    setClusterPoints([]);

    try {
      const embeddings = storedEmbeddingsRef.current;
      const k = Math.min(numClusters, embeddings.length);
      const { clusters } = kMeans(embeddings, k);
      const reduced = pca2d(embeddings);
      const sil = computeSilhouette(embeddings, clusters, k);
      setSilhouette(sil);

      const labelCol = columnNames.find((c) => c !== "notes") ?? "row_index";
      const rows = storedRowsRef.current;
      const points = reduced.map((pt, i) => ({
        x: pt[0],
        y: pt[1],
        cluster: clusters[i],
        label: String(rows[i]?.[labelCol] ?? i),
      }));
      setClusterPoints(points);
    } catch (e) {
      setClusterError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsClustering(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────────

  const displayCols = columnNames.filter((c) => c !== "row_index").slice(0, 5);
  const CLUSTER_COLORS = [
    "#2563eb","#dc2626","#16a34a","#d97706","#7c3aed",
    "#0891b2","#be185d","#15803d","#b45309","#6d28d9",
  ];

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
          href="sample-travels.csv"
          download
          className="text-sm text-blue-600 underline"
        >
          Download sample CSV
        </a>
        <p className="text-xs text-gray-400">Required column: <code>notes</code>. Any other columns are displayed automatically.</p>

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
          <p className="text-sm text-green-600">Trips loaded and indexed! Columns: {columnNames.join(", ")}</p>
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
                  {displayCols.map((col) => (
                    <th key={col} className="px-3 py-2 font-medium capitalize">{col}</th>
                  ))}
                  <th className="px-3 py-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((r, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    {displayCols.map((col) => (
                      <td key={col} className={`px-3 py-2 ${col === "notes" ? "text-gray-500 max-w-xs truncate" : ""}`}>
                        {String(r[col] ?? "")}
                      </td>
                    ))}
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

        {clusterPoints.length > 0 && (
          <ClusterScatter points={clusterPoints} colors={CLUSTER_COLORS} />
        )}
      </section>
    </div>
  );
}

// ── inline k-means ───────────────────────────────────────────────────────────

function kMeans(features: number[][], k: number): { clusters: number[] } {
  const n = features.length;
  const d = features[0].length;
  // k-means++ init
  const centroids: number[][] = [features[Math.floor(Math.random() * n)]];
  while (centroids.length < k) {
    const dists = features.map((f) =>
      Math.min(...centroids.map((c) => euclidean(f, c))) ** 2
    );
    const total = dists.reduce((s, x) => s + x, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < n - 1 && r > 0; idx++) r -= dists[idx];
    centroids.push(features[idx]);
  }
  let labels = new Array(n).fill(0);
  for (let iter = 0; iter < 100; iter++) {
    const newLabels = features.map((f) => {
      let best = 0, bestD = Infinity;
      for (let j = 0; j < k; j++) {
        const dist = euclidean(f, centroids[j]);
        if (dist < bestD) { bestD = dist; best = j; }
      }
      return best;
    });
    for (let j = 0; j < k; j++) {
      const pts = features.filter((_, i) => newLabels[i] === j);
      if (!pts.length) continue;
      for (let dim = 0; dim < d; dim++) {
        centroids[j][dim] = pts.reduce((s, p) => s + p[dim], 0) / pts.length;
      }
    }
    if (newLabels.every((l, i) => l === labels[i])) break;
    labels = newLabels;
  }
  return { clusters: labels };
}

// ── inline PCA to 2D ─────────────────────────────────────────────────────────

function pca2d(features: number[][]): [number, number][] {
  const n = features.length;
  if (n === 0) return [];
  const d = features[0].length;
  const means = new Array(d).fill(0);
  for (const row of features) for (let j = 0; j < d; j++) means[j] += row[j] / n;
  const X = features.map((row) => row.map((v, j) => v - means[j]));
  const eigenvectors: number[][] = [];
  const workCov = Array.from({ length: d }, (_, i) =>
    Array.from({ length: d }, (__, j) =>
      X.reduce((s, row) => s + row[i] * row[j], 0) / Math.max(n - 1, 1)
    )
  );
  for (let e = 0; e < 2; e++) {
    let v = new Array(d).fill(0); v[e % d] = 1;
    for (let iter = 0; iter < 20; iter++) {
      const w = new Array(d).fill(0);
      for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) w[i] += workCov[i][j] * v[j];
      const norm = Math.sqrt(w.reduce((s, x) => s + x * x, 0)) || 1;
      v = w.map((x) => x / norm);
    }
    eigenvectors.push(v);
    // deflate
    for (let i = 0; i < d; i++) for (let j = 0; j < d; j++)
      workCov[i][j] -= v[i] * v[j] * workCov.reduce((s, row, r) => s + row[r] * v[r], 0);
  }
  return X.map((row) => [
    row.reduce((s, x, j) => s + x * eigenvectors[0][j], 0),
    row.reduce((s, x, j) => s + x * eigenvectors[1][j], 0),
  ] as [number, number]);
}

// ── inline silhouette ─────────────────────────────────────────────────────────

function computeSilhouette(embeddings: number[][], clusters: number[], k: number): number {
  const n = embeddings.length;
  if (n <= 1) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const ci = clusters[i];
    let intraSum = 0, intraCount = 0;
    const interSums = new Array(k).fill(0);
    const interCounts = new Array(k).fill(0);
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const d = euclidean(embeddings[i], embeddings[j]);
      if (clusters[j] === ci) { intraSum += d; intraCount++; }
      else { interSums[clusters[j]] += d; interCounts[clusters[j]]++; }
    }
    const a = intraCount > 0 ? intraSum / intraCount : 0;
    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (c !== ci && interCounts[c] > 0) b = Math.min(b, interSums[c] / interCounts[c]);
    }
    if (b === Infinity) b = 0;
    total += (b - a) / Math.max(a, b, 1e-10);
  }
  return total / n;
}

function euclidean(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

// ── scatter component ─────────────────────────────────────────────────────────

function ClusterScatter({
  points,
  colors,
}: {
  points: { x: number; y: number; cluster: number; label: string }[];
  colors: string[];
}) {
  const W = 600, H = 400, PAD = 40;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const toSvg = (x: number, y: number) => ({
    cx: PAD + ((x - xMin) / xRange) * (W - 2 * PAD),
    cy: H - PAD - ((y - yMin) / yRange) * (H - 2 * PAD),
  });

  const [tooltip, setTooltip] = useState<{ label: string; cx: number; cy: number } | null>(null);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border rounded-lg bg-gray-50">
        {points.map((p, i) => {
          const { cx, cy } = toSvg(p.x, p.y);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={5}
              fill={colors[p.cluster % colors.length]}
              opacity={0.8}
              onMouseEnter={() => setTooltip({ label: p.label, cx, cy })}
              onMouseLeave={() => setTooltip(null)}
              className="cursor-pointer"
            />
          );
        })}
        {tooltip && (
          <text
            x={tooltip.cx + 8}
            y={tooltip.cy - 6}
            fontSize={11}
            fill="#374151"
            className="pointer-events-none"
          >
            {tooltip.label}
          </text>
        )}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">
        {Array.from(new Set(points.map((p) => p.cluster))).sort().map((c) => (
          <span key={c} className="flex items-center gap-1 text-xs text-gray-600">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[c % colors.length] }}
            />
            Cluster {c + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TravelExplorerPage;
