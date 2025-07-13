# DataPrism CDN Deployment Guide

## Overview

DataPrism Core's CDN deployment system enables seamless distribution of the WebAssembly-powered analytics engine to various Content Delivery Networks, starting with GitHub Pages and extensible to other providers like Cloudflare Pages, Netlify, and Vercel.

## Quick Start

### 1. Deploy to GitHub Pages (Automated)

The easiest way to deploy DataPrism to a CDN is using GitHub Actions:

```yaml
# .github/workflows/cdn-deploy.yml
name: Deploy to CDN
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build and Deploy CDN
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run build:cdn
          npx dataprism-deploy deploy --target github-pages --repository ${{ github.repository }}
```

### 2. Manual Deployment

```bash
# Build CDN assets
npm run build:cdn

# Deploy to GitHub Pages
npx dataprism-deploy deploy \
  --target github-pages \
  --repository your-org/your-repo \
  --branch gh-pages \
  --environment production

# Validate deployment
npx dataprism-deploy validate https://your-org.github.io/your-repo
```

### 3. Using DataPrism from CDN

Once deployed, integrate DataPrism into your applications:

```html
<!-- ESM (Recommended) -->
<script type="module">
  import { DataPrismEngine } from "https://your-org.github.io/your-repo/core.min.js";

  const engine = new DataPrismEngine();
  await engine.initialize();
  
  const result = await engine.query("SELECT 1 as hello");
  console.log(result);
</script>

<!-- UMD (Legacy) -->
<script src="https://your-org.github.io/your-repo/core.min.js"></script>
<script>
  const engine = new DataPrismCore.DataPrismEngine();
  engine.initialize().then(() => {
    return engine.query("SELECT 1 as hello");
  }).then(result => {
    console.log(result);
  });
</script>
```

## Configuration

### Environment Variables

Configure CDN deployment behavior using environment variables:

```bash
# Deployment target
CDN_TARGET=github-pages

# Compression settings
CDN_COMPRESSION=both          # gzip, brotli, both, none

# Asset versioning
CDN_VERSIONING=hash          # hash, timestamp, semver

# WASM optimization
CDN_WASM_OPTIMIZATION=true   # Enable WASM streaming compilation

# Base URL for assets
CDN_BASE_URL=https://cdn.yourdomain.com
```

### Configuration File

Create a `cdn-deployment.json` for advanced configuration:

```json
{
  "target": "github-pages",
  "environment": "production",
  "repository": "your-org/your-repo",
  "branch": "gh-pages",
  "customDomain": "cdn.yourdomain.com",
  "optimization": {
    "compression": "both",
    "treeshaking": true,
    "codesplitting": true,
    "wasmOptimization": true,
    "minification": true
  },
  "assets": {
    "integrity": true,
    "versioning": "hash",
    "caching": {
      "staticAssets": 31536000,
      "manifests": 3600,
      "wasm": 31536000,
      "plugins": 86400
    }
  },
  "headers": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Embedder-Policy": "require-corp"
  }
}
```

## CDN Providers

### GitHub Pages

**Pros:**
- Free hosting for public repositories
- Automatic SSL certificates
- Git-based deployment workflow
- Custom domain support

**Cons:**
- 1GB repository size limit
- 10 builds per hour limit
- No edge locations (single region)

**Setup:**
1. Enable GitHub Pages in repository settings
2. Configure deployment branch (default: `gh-pages`)
3. Set up GitHub Actions workflow
4. Configure custom domain (optional)

```bash
# Deploy to GitHub Pages
npx dataprism-deploy deploy \
  --target github-pages \
  --repository your-org/your-repo \
  --custom-domain cdn.yourdomain.com
```

### Cloudflare Pages (Coming Soon)

**Pros:**
- Global edge network
- Unlimited bandwidth
- Advanced caching controls
- Workers integration

**Setup:**
```bash
npx dataprism-deploy deploy \
  --target cloudflare-pages \
  --project-name your-project
```

### Netlify (Coming Soon)

**Pros:**
- Easy custom domains
- Branch previews
- Edge functions
- Form handling

### Vercel (Coming Soon)

**Pros:**
- Zero-config deployments
- Automatic optimizations
- Edge runtime
- Analytics

## Build System

### Asset Structure

The CDN build creates an optimized directory structure:

```
cdn/dist/
├── core.min.js              # Main DataPrism engine (2MB limit)
├── core.min.js.map          # Source maps
├── orchestration.min.js     # High-level APIs (800KB limit)
├── plugin-framework.min.js  # Plugin system (500KB limit)
├── assets/
│   ├── dataprism-core.wasm  # WebAssembly binary (1.5MB limit)
│   ├── integrity.json       # Integrity hashes
│   └── manifest.json        # Asset metadata
├── plugins/
│   ├── analytics/           # Plugin categories
│   ├── visualization/
│   └── manifest.json        # Plugin registry
└── deployment-info.json     # Deployment metadata
```

### Build Process

1. **Package Building**: Compile TypeScript and Rust code
2. **Asset Optimization**: Minification, compression, tree-shaking
3. **WASM Processing**: Streaming compilation support, integrity hashes
4. **Manifest Generation**: Asset registry with integrity verification
5. **Plugin Discovery**: Automatic plugin manifest generation
6. **Size Validation**: Enforce bundle size limits
7. **Deployment**: Upload to CDN provider with proper headers

### Size Limits

- **Core Bundle**: 2MB maximum
- **WASM Binary**: 1.5MB maximum  
- **Orchestration**: 800KB maximum
- **Plugin Framework**: 500KB maximum
- **Individual Plugins**: 500KB maximum
- **Total CDN**: 5MB maximum

## Plugin System

### Plugin Manifest

Plugins are automatically discovered and catalogued:

```json
{
  "plugins": [
    {
      "id": "csv-importer",
      "name": "CSV Importer",
      "version": "1.0.0",
      "entry": "plugins/integration/csv-importer.js",
      "dependencies": [],
      "metadata": {
        "description": "Import CSV data into DataPrism",
        "author": "DataPrism Team",
        "category": "integration",
        "size": 25600,
        "loadOrder": 10,
        "lazy": true
      },
      "integrity": "sha384-...",
      "exports": ["CSVImporter", "default"]
    }
  ],
  "categories": [
    {
      "id": "integration",
      "name": "Data Integration",
      "description": "Import and export data",
      "plugins": ["csv-importer", "json-importer"]
    }
  ]
}
```

### Dynamic Plugin Loading

Load plugins at runtime from the CDN:

```javascript
import { pluginLoader } from '@dataprism/cdn-loader';

// Initialize plugin system
await pluginLoader.initialize('https://cdn.yourdomain.com/plugins/manifest.json');

// Load specific plugin
const csvPlugin = await pluginLoader.loadPlugin('csv-importer');

// Load plugins by category
const integrationPlugins = await pluginLoader.loadPluginsByCategory('integration');

// Use plugin
const importer = new csvPlugin.instance.CSVImporter();
const data = await importer.import(csvFile);
```

## Security

### Subresource Integrity

All assets include integrity hashes for verification:

```html
<script 
  src="https://cdn.yourdomain.com/core.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>
```

### Content Security Policy

Recommended CSP headers for DataPrism:

```html
<meta http-equiv="Content-Security-Policy" content="
  script-src 'self' 'wasm-unsafe-eval' cdn.yourdomain.com;
  worker-src 'self' blob:;
  connect-src 'self' cdn.yourdomain.com;
  object-src 'none';
  base-uri 'self'
">
```

### CORS Configuration

CDN assets are served with appropriate CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

## Performance

### Optimization Features

- **WebAssembly Streaming**: Parallel download and compilation
- **Asset Compression**: Gzip and Brotli support
- **Code Splitting**: Separate bundles for different use cases
- **Tree Shaking**: Remove unused code
- **HTTP/2**: Parallel asset loading
- **Cache Headers**: Long-term caching with versioned URLs

### Performance Targets

- **Initial Load**: <5 seconds (including WASM)
- **Plugin Loading**: <1 second per plugin
- **WASM Compilation**: <2 seconds
- **Bundle Compression**: >30% size reduction

### Monitoring

Track performance with built-in metrics:

```javascript
import { performanceMonitor } from '@dataprism/core';

performanceMonitor.on('load-complete', (metrics) => {
  console.log('Load time:', metrics.totalLoadTime);
  console.log('WASM compile time:', metrics.wasmCompileTime);
  console.log('Plugin load times:', metrics.pluginLoadTimes);
});
```

## Validation

### Deployment Validation

Automatically validate deployments:

```bash
# Basic validation
npx dataprism-deploy validate https://cdn.yourdomain.com

# Strict validation mode
npx dataprism-deploy validate https://cdn.yourdomain.com --strict

# Performance validation
npx dataprism-deploy validate https://cdn.yourdomain.com --performance
```

### Validation Checks

- **Connectivity**: Asset accessibility
- **CORS Headers**: Cross-origin configuration
- **Cache Headers**: Performance optimization
- **WASM Loading**: WebAssembly compatibility
- **Plugin System**: Dynamic loading functionality
- **Security Headers**: Security best practices
- **Asset Integrity**: Hash verification
- **Performance**: Load time benchmarks

## Troubleshooting

### Common Issues

#### "Failed to load WASM"

**Cause**: Incorrect MIME type or CORS headers
**Solution**: Ensure WASM files are served with `Content-Type: application/wasm`

```nginx
# Nginx configuration
location ~* \.wasm$ {
    add_header Content-Type application/wasm;
    add_header Cross-Origin-Embedder-Policy require-corp;
    add_header Cross-Origin-Opener-Policy same-origin;
}
```

#### "Plugin failed to load"

**Cause**: Missing dependencies or integrity check failure
**Solution**: Check plugin manifest and dependency order

```bash
# Debug plugin loading
npx dataprism-deploy validate https://cdn.yourdomain.com --plugins
```

#### "Bundle size exceeded"

**Cause**: Assets exceed size limits
**Solution**: Enable more aggressive optimization

```bash
# Check bundle sizes
npm run size-check:cdn

# Optimize bundles
CDN_COMPRESSION=both CDN_WASM_OPTIMIZATION=true npm run build:cdn
```

#### "Deployment failed"

**Cause**: Authentication or permission issues
**Solution**: Check repository access and tokens

```bash
# Test GitHub connection
npx dataprism-deploy test-connection --target github-pages

# Debug deployment
npx dataprism-deploy deploy --dry-run --verbose
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
DEBUG=dataprism:* npx dataprism-deploy deploy
```

### Health Checks

Monitor CDN health:

```bash
# Basic health check
curl -I https://cdn.yourdomain.com/manifest.json

# Performance check
curl -w "%{time_total}" https://cdn.yourdomain.com/core.min.js
```

## Advanced Usage

### Custom Deployment Providers

Extend the system with custom CDN providers:

```typescript
import { BaseDeploymentProvider } from '@dataprism/deployment';

class CustomCDNProvider extends BaseDeploymentProvider {
  name = 'custom-cdn';
  supportedTargets = ['custom-cdn'];

  async deploy(assets: AssetBundle, config: DeploymentConfig) {
    // Implementation
  }

  async validate(url: string, config: DeploymentConfig) {
    // Implementation
  }
}
```

### Build Hooks

Add custom logic to the build process:

```javascript
// tools/build/custom-plugin.js
export function customBuildPlugin() {
  return {
    name: 'custom-build',
    generateBundle(options, bundle) {
      // Custom processing
    }
  };
}
```

### CI/CD Integration

#### GitHub Actions

```yaml
- name: Deploy CDN
  uses: dataprism/cdn-deploy-action@v1
  with:
    target: github-pages
    repository: ${{ github.repository }}
    token: ${{ secrets.GITHUB_TOKEN }}
```

#### GitLab CI

```yaml
deploy_cdn:
  script:
    - npm run build:cdn
    - npx dataprism-deploy deploy --target github-pages
  only:
    - main
```

## API Reference

### CLI Commands

```bash
# Deploy assets
dataprism-deploy deploy [options]

# Validate deployment
dataprism-deploy validate <url> [options]

# Rollback deployment
dataprism-deploy rollback <deployment-id> [options]

# List deployments
dataprism-deploy list [options]

# Test connection
dataprism-deploy test-connection [options]
```

### JavaScript API

```typescript
import { CDNDeploymentOrchestrator } from '@dataprism/deployment';

const orchestrator = new CDNDeploymentOrchestrator();

// Deploy
const result = await orchestrator.deploy({
  target: 'github-pages',
  repository: 'your-org/your-repo',
  environment: 'production'
});

// Validate
const validation = await orchestrator.validate('https://cdn.yourdomain.com');

// Rollback
await orchestrator.rollback('deployment-id', options);
```

## Best Practices

### Development Workflow

1. **Local Development**: Use `npm run dev` for development
2. **Testing**: Run `npm test` before deployment
3. **Staging**: Deploy to staging environment first
4. **Production**: Use automated deployment on main branch
5. **Validation**: Always validate after deployment
6. **Monitoring**: Set up performance monitoring

### Security Best Practices

1. **Use HTTPS**: Always serve assets over HTTPS
2. **Integrity Hashes**: Verify asset integrity
3. **CORS Headers**: Configure appropriate CORS policies
4. **Security Headers**: Implement security headers
5. **Regular Updates**: Keep dependencies updated
6. **Access Control**: Limit deployment permissions

### Performance Best Practices

1. **Bundle Size**: Monitor and optimize bundle sizes
2. **Compression**: Enable compression on CDN
3. **Caching**: Use appropriate cache headers
4. **Preloading**: Preload critical assets
5. **Lazy Loading**: Load plugins on demand
6. **CDN Edge**: Use CDN edge locations

## Migration Guide

### From Local to CDN

1. **Update imports**: Change local imports to CDN URLs
2. **Configure CORS**: Set up cross-origin headers
3. **Update CSP**: Modify Content Security Policy
4. **Test thoroughly**: Validate all functionality
5. **Monitor performance**: Check load times

### Version Updates

1. **Semantic versioning**: Use versioned CDN URLs
2. **Backward compatibility**: Maintain API compatibility
3. **Gradual rollout**: Deploy to staging first
4. **Fallback strategy**: Implement fallback mechanisms
5. **User notification**: Communicate changes

## Support

### Documentation

- [API Reference](./api-reference.md)
- [Plugin Development](./plugin-development.md)
- [Performance Guide](./performance.md)
- [Security Guide](./security.md)

### Community

- [GitHub Discussions](https://github.com/dataprism/core/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/dataprism)
- [Discord Community](https://discord.gg/dataprism)

### Issues

Report bugs and request features:
- [GitHub Issues](https://github.com/dataprism/core/issues)
- [Security Issues](mailto:security@dataprism.dev)

---

For more information, visit the [DataPrism Documentation](https://docs.dataprism.dev).