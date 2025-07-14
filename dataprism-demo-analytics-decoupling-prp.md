# DataPrism Demo Analytics Decoupling PRP Template

This Product Requirements Prompt (PRP) defines the requirements for decoupling the `demo-analytics` app from the DataPrism monorepo. The goal is to establish `demo-analytics` as an independent, maintainable application that references only published CDN builds of DataPrism (e.g., via GitHub Pages), with its own repository, CI/CD, and documentation.

## 1. Objective

Decouple the Analytics Demo (`demo-analytics`) from the DataPrism platform so it becomes a standalone application:
- Maintained in a separate GitHub repository.
- Consumes DataPrism platform builds exclusively via CDN (e.g., GitHub Pages).
- Demonstrates DataPrism usage without local platform code or dependencies.

## 2. Scope

- Migration of all demo-analytics source code to a new, independent repository.
- Removal of all direct/monorepo dependencies on DataPrism platform code.
- Refactoring of build and runtime to only load DataPrism from CDN URLs.
- Documentation and CI/CD for independent deployment.
- Support for future upgrades of DataPrism via CDN versioning.

## 3. Functional Requirements

- **Repository Independence**
  - Host demo-analytics in its own GitHub repository.
  - Remove all monorepo references and local imports from DataPrism.

- **CDN Integration**
  - Reference DataPrism JS, WASM, and plugin assets via CDN URLs (e.g., GitHub Pages, jsDelivr).
  - Externalize all DataPrism dependencies in build configs (e.g., webpack externals, Vite `external`).

- **Build & Deployment**
  - Provide a standalone build pipeline (e.g., Vite, Webpack, or similar).
  - Enable deployment to GitHub Pages or other static hosting/CDN.
  - Ensure all DataPrism updates are consumed via CDN version bump, not code pull.

- **Configuration**
  - Allow easy switching of DataPrism CDN versions (e.g., via `.env` or config file).
  - Document the mapping between DataPrism platform versions and demo-analytics compatibility.

- **Documentation**
  - README with setup, usage, and deployment instructions.
  - Guide for updating DataPrism CDN references.
  - Contribution guidelines for demo-analytics as an independent project.

## 4. Non-Functional Requirements

- **Performance**
  - Demo app loads DataPrism from CDN in <5 seconds on modern broadband.
  - No local platform code—only CDN assets.

- **Reliability**
  - Demo app must work with any valid DataPrism CDN version.
  - Build must fail if CDN assets are unavailable or misconfigured.

- **Maintainability**
  - Clear separation of demo app code and DataPrism platform.
  - Automated tests to verify CDN integration and app functionality.

- **Security**
  - Validate all CDN asset URLs and integrity (e.g., SRI hashes if possible).
  - Serve over HTTPS only.

## 5. Quality Assurance

- Automated tests for app initialization and DataPrism CDN loading.
- CI pipeline for build, test, and deploy to chosen static hosting.
- Manual test checklist for:
  - CDN asset availability.
  - Demo workflows (data import, visualization, export, etc.).
  - Cross-browser compatibility (Chrome, Firefox, Safari, Edge).

## 6. Deliverables

- New `demo-analytics` GitHub repository.
- Standalone build and deployment pipeline.
- Demo app referencing DataPrism via CDN only.
- Documentation for usage, updates, and troubleshooting.
- CI/CD configuration for automated deployment (e.g., GitHub Actions).

## 7. Success Criteria

- Demo-analytics can be cloned, configured, and deployed independently of the DataPrism platform repo.
- All DataPrism assets are loaded via CDN; no local DataPrism code remains.
- Switching DataPrism versions is a config change, not a code change.
- Documentation enables new users to deploy and update the demo app in <30 minutes.

## 8. Example CDN Integration (Pseudo-code)

Below are example snippets demonstrating how to load DataPrism assets from a CDN into your standalone demo-analytics app.

### HTML Integration

```html
<!-- Load DataPrism JavaScript bundle from CDN -->
<script src="https://cdn.example.com/dataprism/v1.0.0/dataprism.js"></script>
<!-- Optionally, load DataPrism CSS for default styles -->
<link rel="stylesheet" href="https://cdn.example.com/dataprism/v1.0.0/dataprism.css" />
```

### WASM Asset Loading

```html
<!-- No direct <script> for WASM; the JS bundle loads the WASM file dynamically.
     Ensure the WASM file is accessible at the expected CDN path. -->
```

### Application Initialization (JavaScript)

```javascript
// Wait for DataPrism to be available on window (if loaded via <script>)
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize DataPrism with the WASM asset URL from CDN
  await window.DataPrism.init({
    wasmUrl: 'https://cdn.example.com/dataprism/v1.0.0/dataprism-core.wasm',
    plugins: [
      // Example: load plugins from CDN as needed
      'https://cdn.example.com/dataprism/v1.0.0/plugins/csv-importer.js',
      'https://cdn.example.com/dataprism/v1.0.0/plugins/observable-charts.js'
    ]
  });

  // Example: Use DataPrism API to load data and render a chart
  const result = await window.DataPrism.loadCSV('https://your-data-source.com/data.csv');
  window.DataPrism.renderChart('bar', result, { container: '#chart-div' });
});
```

### Plugin Loading (Optional Advanced Example)

```javascript
// Dynamically load a plugin after app initialization
await window.DataPrism.loadPlugin('https://cdn.example.com/dataprism/v1.0.0/plugins/openai-llm.js');

// Use the plugin as needed
const suggestions = await window.DataPrism.plugins.openaiLlm.suggestLabels('occupation');
window.DataPrism.applyLabels(suggestions);
```

### Environment Configuration (Optional)

```env
# .env or config.js
DATAPRISM_CDN=https://cdn.example.com/dataprism/v1.0.0/
```

Then reference in your app code:

```javascript
const CDN = process.env.DATAPRISM_CDN || 'https://cdn.example.com/dataprism/v1.0.0/';
await window.DataPrism.init({ wasmUrl: `${CDN}dataprism-core.wasm` });
```

**Notes:**
- Replace `https://cdn.example.com/dataprism/v1.0.0/` with your actual CDN or GitHub Pages URL.
- Ensure all referenced assets (JS, WASM, plugins) are published and accessible at the specified paths.
- For Subresource Integrity (SRI), add `integrity` and `crossorigin` attributes to your `<script>` and `<link>` tags if supported by your CDN.

This integration ensures the demo-analytics app is fully decoupled and always loads the latest DataPrism platform code directly from the CDN.

## 9. How to Use This PRP

1. Copy this template into your `/PRPs` directory or new demo-analytics repo.
2. Edit each section to reflect your project's specifics.
3. Submit to your context engineering workflow (e.g., `/generate-prp demo-analytics-decoupling.md`).
4. Iterate based on feedback and implementation outcomes.

---

**References:**
- GitHub Pages as CDN best practices
- Decoupling architecture strategies  
- Externalizing dependencies in builds