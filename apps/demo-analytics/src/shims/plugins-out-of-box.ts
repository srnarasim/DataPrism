// Slim re-export shim for @dataprism/plugins-out-of-box.
// Only exports what demo-analytics actually uses, avoiding csv-importer.ts
// and observable-charts.ts (which need papaparse/plotly not installed here).
export { SemanticClusteringPlugin } from "../../../../packages/plugins/out-of-box/src/plugins/processing/semantic-clustering";
