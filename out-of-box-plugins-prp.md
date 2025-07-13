# DataPrism Core – Out-of-the-Box Plugin PRP Collection

This Markdown file lists **ready-made Product Requirements Prompts (PRPs)** for a baseline set of plugins that cover the most common use-cases expected in a DataPrism Core deployment.  Each section contains a fully-structured PRP skeleton pre-filled with the essential context, ready for the `/generate-plugin-prp` → `/execute-plugin-prp` workflow.

> **How to use**  
> 1. Copy the PRP block that matches your need.  
> 2. Adjust any OPTIONAL fields.  
> 3. Feed the block to `/generate-plugin-prp` to obtain an implementation plan.  
> 4. Run `/execute-plugin-prp`.

---

## 1 · Visualization Plugins

### 1.1 Observable Charts Plugin
````md
### PRP • Observable Charts Plugin

**Plugin Category:** Visualization  
**Plugin Name:** ObservableCharts  
**Purpose:** Provide a suite of high-performance, reactive chart components (bar, line, area, scatter, histogram) built with the Observable Framework and seamlessly bound to DuckDB-WASM result sets.

#### Architecture Integration
- Implements **IVisualizationPlugin**.
- Distributed as an ES module that internally boots the Observable runtime.
- Consumes Arrow tables streamed from the JavaScript orchestration layer.
- Emits render events to the global event bus (`eventbus://viz/*`).

#### Functional Requirements
1. Render at least 5 core chart types with interactive tooltips & pan/zoom.  
2. Auto-detect data schema and suggest suitable chart defaults.  
3. Accept declarative **ChartSpec** JSON to enable low-code usage.  
4. Support live-update mode for streaming DuckDB queries.

#### Performance & Compatibility
- Initial load ≤ 300-ms (gzipped ≤ 120 kB).  
- Handle 50 k points at ≥ 30 fps.  
- Browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.

#### Validation & QA
- Unit tests for each chart type.  
- FPS benchmark with 10 k, 25 k, 50 k points.  
- Visual regression tests via Playwright.
````

### 1.2 Plotly Advanced Charts Plugin *(OPTIONAL)*
_A drop-in replacement using Plotly.js for 3-D, polar and statistical charts._

---

## 2 · Data-Integration Plugins

### 2.1 CSV Importer
````md
### PRP • CSV Importer Plugin

**Plugin Category:** Integration  
**Plugin Name:** CSVImporter  
**Purpose:** Stream large CSV/TSV files (≤ 4 GB) directly into DuckDB-WASM with automatic type inference and data-quality metrics.

#### Architecture Integration
- Implements **IIntegrationPlugin**.  
- Utilises `PapaParse` Web Worker for chunk parsing.  
- Pipes chunks into DuckDB using `copy_from`.

#### Functional Requirements
1. Support UTF-8/UTF-16/Latin-1 encodings.  
2. Schema preview of first 1 000 rows.  
3. Detect delimiter, quote & escape chars automatically.  
4. Surface import errors with row/col coordinates.

#### Performance Targets
- Sustain ≥ 8 MB/s parse throughput on mid-tier laptop.  
- Memory overhead ≤ 1.2× file size.
````

### 2.2 Parquet Importer
````md
### PRP • Parquet Importer Plugin

**Plugin Category:** Integration  
**Plugin Name:** ParquetImporter  
**Purpose:** Load columnar Parquet files (local or remote) into DuckDB-WASM with predicate push-down and selective column projection.

#### Architecture Integration
- Implements **IIntegrationPlugin**.  
- Uses DuckDB native `read_parquet` bindings.  
- Supports HTTP Range requests for remote files.

#### Functional Requirements
1. Column selection UI with type badges.  
2. Row-group–level statistics preview.  
3. Wildcard import: `s3://bucket/*.parquet`.

#### Performance Targets
- Import 1-GB Parquet < 15 s on SSD.  
- Only touch projected columns in memory.
````

### 2.3 Excel Importer *(XLS/XLSX)*
_Similar skeleton – uses `SheetJS` WASM build; converts sheets to Arrow before ingestion._

---

## 3 · LLM Plugins

### 3.1 OpenAI LLM Connector
````md
### PRP • OpenAI Connector Plugin

**Plugin Category:** Integration  
**Plugin Name:** OpenAIConnector  
**Purpose:** Provide access to ChatGPT & GPT-4o models for natural-language SQL generation, auto-classification suggestions and insight summaries.

#### Architecture Integration
- Implements **IIntegrationPlugin**.  
- Wraps OpenAI REST (v1) with streaming support.  
- Caches responses in IndexedDB keyed by hash(prompt+model).

#### Functional Requirements
1. Configurable model (gpt-3.5-turbo | gpt-4o).  
2. Prompt-template library for SQL, classification, explanation.  
3. Token & cost tracker with soft-limit alerts.  
4. Offline fallback message when API unreachable.

#### Security & Privacy
- No user data stored on vendor servers after response.  
- PII redaction toggle prior to request.

#### Rate-Limit Handling
- Exponential back-off on 429.  
- Queue ≤ 100 pending requests.
````

### 3.2 Claude Connector *(OPTIONAL)*

---

## 4 · Data-Processing Plugins

### 4.1 Semantic Clustering
````md
### PRP • Semantic Clustering Plugin

**Plugin Category:** Data Processing  
**Plugin Name:** SemanticClustering  
**Purpose:** Generate embeddings, run K-means/DBSCAN, and surface interactive cluster views for bulk classification.

#### Architecture Integration
- Implements **IDataProcessorPlugin** & **IVisualizationPlugin**.  
- Embeddings via ONNX.js (default) or OpenAI if enabled.  
- Clustering executed in Web Worker with `ml-distance`.

#### Functional Requirements
1. Support text & numeric composite embeddings.  
2. t-SNE/UMAP 2-D plots with lasso selection.  
3. Cluster quality metrics (silhouette, Davies–Bouldin).  
4. Export cluster labels back to DuckDB table.

#### Performance Targets
- Embed 100 k rows in ≤ 90 s locally.  
- Cluster 100 k vectors (dim = 384) in ≤ 60 s.
````

### 4.2 Duplicate Detection *(OPTIONAL)*

---

## 5 · Utility Plugins

### 5.1 Performance Monitor
````md
### PRP • Performance Monitor Plugin

**Plugin Category:** Utility  
**Plugin Name:** PerfMonitor  
**Purpose:** Live dashboard of FPS, memory, DuckDB query timings & WebAssembly heap usage.

#### Architecture Integration
- Implements **IUtilityPlugin**.  
- Hooks into core telemetry bus and `performance.mark()` API.

#### Functional Requirements
1. Overlay mode & detached window mode.  
2. Export CSV of performance logs.  
3. Threshold alerts (toast + event).

#### Overhead Budget
- CPU < 2% idle, < 5% under load.  
- Memory < 25 MB.
````

---

## 6 · Extending This Collection
- Duplicate any block, change **Plugin Name** & adjust specifics.  
- Keep the seven-section PRP format for consistency.  
- Optional plugins marked can be removed to slim the baseline bundle.

> **Remember:** After pasting a PRP into `/generate-plugin-prp`, the AI will create a detailed plan with file paths, tests and validation steps.
