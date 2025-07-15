# DataPrism Deployment Guide

## Quick Reference

### Branch Structure
```
main (source) 
├── docs (VitePress documentation)
└── gh-pages (CDN assets)
```

### Deployment URLs
- **Documentation**: https://srnarasim.github.io/DataPrism/
- **CDN Assets**: https://srnarasim.github.io/DataPrism/ (when CDN mode active)

## Common Tasks

### 📝 Update Documentation
```bash
# Edit files in apps/docs/
git checkout main
# Edit apps/docs/guide/getting-started.md
git add apps/docs/
git commit -m "Update getting started guide"
git push origin main
# → Automatically deploys to docs branch
```

### 🔧 Update CDN Assets
```bash
# Edit packages, tools, or cdn directories
git checkout main
# Edit packages/core/src/lib.rs
git add packages/
git commit -m "Update core library"
git push origin main
# → Automatically deploys to gh-pages branch
```

### 🚀 Manual Deployment
```bash
# Trigger documentation deployment
gh workflow run deploy-docs.yml

# Trigger CDN deployment
gh workflow run cdn-deploy.yml

# Check deployment status
gh workflow run branch-sync-check.yml
```

## Troubleshooting

### Documentation Not Updating
1. **Check workflow**: Visit Actions tab → `Deploy Documentation`
2. **Verify paths**: Changes must be in `apps/docs/` directory
3. **Manual trigger**: Use `gh workflow run deploy-docs.yml`

### CDN Assets Not Updating
1. **Check workflow**: Visit Actions tab → `CDN Deployment`
2. **Verify paths**: Changes must be in `packages/`, `tools/build/`, or `cdn/`
3. **Manual trigger**: Use `gh workflow run cdn-deploy.yml`

### Branch Conflicts
- **Never commit directly to `docs` or `gh-pages`**
- All changes go through `main` branch
- Use PRs for code review
- Deployment branches are auto-generated

## Monitoring

### Branch Status
- Run `gh workflow run branch-sync-check.yml` to check sync status
- Automatic monitoring every 6 hours
- Alerts when branches fall behind

### Deployment Health
- Documentation: Check https://srnarasim.github.io/DataPrism/
- CDN: Check bundle availability and sizes
- GitHub Actions: Monitor workflow success rates

## Best Practices

### Development
1. Create feature branch from `main`
2. Make changes in appropriate directories
3. Test locally before pushing
4. Create PR to `main`
5. Merge triggers automatic deployment

### Content Organization
- **Documentation**: `apps/docs/` → VitePress site
- **CDN Assets**: `packages/`, `tools/build/`, `cdn/` → JavaScript/WASM bundles
- **Configuration**: Root level configs affect both

### Emergency Procedures
- Use `workflow_dispatch` for manual deployments
- Check GitHub Actions logs for deployment failures
- Never bypass `main` branch for deployment fixes

## Advanced Usage

### Custom Deployment
```bash
# Deploy to staging (future)
gh workflow run deploy-docs.yml -f environment=staging

# Force deployment without changes
gh workflow run deploy-docs.yml -f force_deploy=true
```

### Branch Maintenance
```bash
# Check branch differences
git log --oneline origin/docs..origin/main -- apps/docs/
git log --oneline origin/gh-pages..origin/main -- packages/ tools/build/ cdn/

# View deployment history
git log --oneline origin/docs
git log --oneline origin/gh-pages
```

## Security Notes

- Deployment branches are auto-generated
- No secrets stored in deployment branches
- All changes reviewed via PR process
- Automated security scanning enabled