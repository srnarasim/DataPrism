# DataPrism CDN Distribution

This directory contains the CDN-optimized builds of DataPrism Core packages.

## CDN Usage

### ESM (Recommended)

```html
<script type="module">
  import { DataPrismEngine } from "https://cdn.dataprism.dev/v1.0.0/core.min.js";

  const engine = new DataPrismEngine();
  await engine.initialize();

  const result = await engine.query("SELECT 1 as hello");
  console.log(result);
</script>
```

### UMD (Legacy)

```html
<script src="https://cdn.dataprism.dev/v1.0.0/core.min.js"></script>
<script>
  const engine = new DataPrismCore.DataPrismEngine();
  engine
    .initialize()
    .then(() => {
      return engine.query("SELECT 1 as hello");
    })
    .then((result) => {
      console.log(result);
    });
</script>
```

## Available Packages

### Core Engine

- `core.min.js` - Main DataPrism engine with DuckDB integration
- `core.min.js.map` - Source map for debugging

### Plugin Framework

- `plugin-framework.min.js` - Plugin development framework
- `plugin-framework.min.js.map` - Source map for debugging

### Orchestration Layer

- `orchestration.min.js` - High-level orchestration APIs
- `orchestration.min.js.map` - Source map for debugging

### WebAssembly Assets

- `assets/*.wasm` - WebAssembly binaries
- `assets/integrity.json` - Integrity hashes for verification

## Security

All CDN assets include integrity hashes for subresource integrity (SRI) verification:

```html
<script
  src="https://cdn.dataprism.dev/v1.0.0/core.min.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

Integrity hashes are available in `assets/integrity.json`.

## Performance

- All bundles are optimized for size and performance
- Gzip compression is enabled on the CDN
- WebAssembly files use streaming compilation when possible
- HTTP/2 push is configured for dependent resources

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Versioning

CDN URLs include version numbers for cache stability:

- Latest: `https://cdn.dataprism.dev/latest/`
- Specific version: `https://cdn.dataprism.dev/v1.0.0/`
- Major version: `https://cdn.dataprism.dev/v1/`

## Build Information

This CDN distribution was built on: {{ BUILD_DATE }}
Package versions:

- @dataprism/core: {{ CORE_VERSION }}
- @dataprism/plugin-framework: {{ PLUGIN_VERSION }}
- @dataprism/orchestration: {{ ORCHESTRATION_VERSION }}

Total bundle size: {{ TOTAL_SIZE }}
Compression ratio: {{ COMPRESSION_RATIO }}

## CORS Headers

The CDN is configured with appropriate CORS headers for cross-origin usage:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Content-Type
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

## Support

For CDN-related issues:

- Check the [status page](https://status.dataprism.dev)
- Report issues at [GitHub Issues](https://github.com/dataprism/core/issues)
- Documentation: [https://docs.dataprism.dev/cdn](https://docs.dataprism.dev/cdn)
