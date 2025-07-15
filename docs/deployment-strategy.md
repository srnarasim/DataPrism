# DataPrism Deployment Strategy

## Overview
DataPrism uses a multi-branch deployment strategy to separate different types of content and optimize delivery.

## Branch Structure

### Source Branches
- **`main`**: Primary development branch
  - Contains source code
  - Triggers builds when packages/* or docs/* change
  - Protected branch requiring PR reviews

### Deployment Branches
- **`docs`**: VitePress documentation site
  - Auto-deployed from `apps/docs/` in main
  - Serves documentation at GitHub Pages
  - Triggers: Changes to `apps/docs/**`

- **`gh-pages`**: CDN assets
  - Auto-deployed from `cdn/dist/` build output
  - Serves JS/WASM bundles for CDN usage
  - Triggers: Changes to `packages/**`, `tools/build/**`, `cdn/**`

## Deployment Workflows

### Documentation Deployment
```yaml
Trigger: apps/docs/** changes
Source: apps/docs/
Build: VitePress build
Target: docs branch
URL: https://[username].github.io/DataPrism/
```

### CDN Deployment
```yaml
Trigger: packages/**, tools/build/**, cdn/** changes
Source: Rust packages + TypeScript orchestration
Build: wasm-pack + webpack
Target: gh-pages branch
URL: https://[username].github.io/DataPrism/ (CDN mode)
```

## Content Management Rules

### 1. Documentation Changes
- **Path**: `apps/docs/**`
- **Workflow**: `deploy-docs.yml`
- **Target**: `docs` branch
- **When**: VitePress content updates, API docs, guides

### 2. CDN Asset Changes
- **Path**: `packages/**`, `tools/build/**`, `cdn/**`
- **Workflow**: `cdn-deploy.yml`
- **Target**: `gh-pages` branch
- **When**: Core library updates, WASM builds, bundle changes

### 3. Source Code Changes
- **Path**: Other paths in `main`
- **Workflow**: CI/CD testing only
- **Target**: No automatic deployment
- **When**: Development, testing, configuration

## Branch Synchronization

### Automatic Sync
- ✅ `main` → `docs` (via GitHub Actions)
- ✅ `main` → `gh-pages` (via GitHub Actions)
- ❌ `docs` ← `gh-pages` (not needed)

### Manual Sync Requirements
- None - all deployments are automated
- Branch conflicts resolved through main branch

## GitHub Pages Configuration

### Current Setup
```yaml
Repository Settings:
  Pages Source: docs branch
  Custom Domain: None
  Enforce HTTPS: Yes
```

### Recommended Future Setup
```yaml
Repository Settings:
  Pages Source: docs branch
  Custom Domain: docs.dataprism.dev
  CDN Access: cdn.dataprism.dev → gh-pages branch
```

## Troubleshooting Common Issues

### Issue: "Documentation not updating"
**Cause**: Documentation workflow not triggered
**Solution**: Check if changes are in `apps/docs/` path
**Verify**: Check GitHub Actions for `deploy-docs.yml`

### Issue: "CDN assets outdated"
**Cause**: CDN workflow not triggered
**Solution**: Check if changes are in `packages/`, `tools/build/`, or `cdn/`
**Verify**: Check GitHub Actions for `cdn-deploy.yml`

### Issue: "Branch conflicts"
**Cause**: Manual changes to deployment branches
**Solution**: Never commit directly to `docs` or `gh-pages`
**Process**: All changes via `main` branch PRs

## Best Practices

### Development Workflow
1. Create feature branch from `main`
2. Make changes to appropriate directories
3. Test locally
4. Create PR to `main`
5. Merge triggers automatic deployment

### Content Updates
- **Documentation**: Edit files in `apps/docs/`
- **API Changes**: Update code + regenerate docs
- **CDN Updates**: Modify packages or build tools
- **Configuration**: Update in `main`, not deployment branches

### Emergency Fixes
- Never commit directly to `docs` or `gh-pages`
- Use `main` branch hotfix → automatic deployment
- Use workflow_dispatch for manual deployments

## Monitoring and Validation

### Deployment Health
- Documentation: https://[username].github.io/DataPrism/
- CDN Assets: Check manifest.json and core bundles
- Build Status: GitHub Actions status badges

### Performance Monitoring
- Bundle sizes enforced in CI
- Load time validation
- WASM compatibility checks

## Future Enhancements

### Multi-Environment Support
- `staging` branch for pre-production
- `demo` branch for live demonstrations
- Environment-specific configurations

### CDN Optimization
- Separate CDN subdomain
- Edge caching strategies
- Asset versioning improvements

## Security Considerations

- Deployment branches are auto-generated
- No secrets in deployment branches
- PR reviews required for main branch
- Automated security scanning

## Maintenance

### Regular Tasks
- Monitor deployment branch sizes
- Update dependencies in main
- Review workflow performance
- Clean up old deployment artifacts

### Branch Cleanup
- Deployment branches: Auto-managed
- Feature branches: Manual cleanup
- Release branches: Tagged and archived