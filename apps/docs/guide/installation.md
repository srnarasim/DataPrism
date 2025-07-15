# Installation

Learn how to install DataPrism in your project.

## CDN Installation

The fastest way to get started with DataPrism is via CDN:

```html
<!-- ES Module -->
<script type="module">
import { DataPrismEngine } from "https://srnarasim.github.io/DataPrism/dataprism.min.js";

const engine = new DataPrismEngine();
await engine.initialize();
</script>

<!-- UMD Bundle -->
<script src="https://srnarasim.github.io/DataPrism/dataprism.umd.js"></script>
<script>
  const { DataPrismEngine } = DataPrism;
  const engine = new DataPrismEngine();
</script>
```

## Package Manager Installation

### npm

```bash
npm install @dataprism/core
```

### yarn

```bash
yarn add @dataprism/core
```

### pnpm

```bash
pnpm add @dataprism/core
```

## Browser Requirements

DataPrism requires modern browser support:

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## WebAssembly Support

DataPrism relies on WebAssembly for high-performance analytics. All supported browsers have native WebAssembly support.

## Next Steps

- [Quick Start Guide](/guide/quick-start)
- [Basic Usage Examples](/examples/)
- [API Reference](/api/)