# Documentation Development Process

This document outlines the improved documentation development process for DataPrism Core to prevent synchronization issues between main and gh-pages branches.

## Overview

The documentation system has been completely restructured to use automated deployment and validation, eliminating manual synchronization issues.

## Architecture

### Current Setup

- **Source**: Documentation written in Markdown in `apps/docs/` directory
- **Build**: VitePress generates static HTML files
- **Deployment**: GitHub Actions automatically deploys to gh-pages branch
- **Validation**: Pre-build validation ensures all links and files exist

### Key Components

1. **GitHub Actions Workflow** (`.github/workflows/deploy-docs.yml`)
   - Automatically triggered on changes to `apps/docs/` in main branch
   - Validates documentation structure
   - Builds and deploys to GitHub Pages
   - No manual intervention required

2. **Validation Scripts**
   - `apps/docs/scripts/validate-docs.js` - Validates file structure and links
   - `apps/docs/scripts/check-links.js` - Checks for broken links in built HTML
   - Runs automatically before every build

3. **VitePress Configuration**
   - Fixed configuration in `apps/docs/.vitepress/config.js`
   - Consistent build outputs
   - Proper path handling

## Development Workflow

### For Documentation Changes

1. **Create/Edit Documentation**
   ```bash
   # Work in main branch
   cd apps/docs
   
   # Create or edit markdown files
   # Files must match the structure defined in .vitepress/config.js
   ```

2. **Local Development**
   ```bash
   # Start development server
   npm run dev
   
   # Validate documentation
   npm run validate
   
   # Build and check links
   npm run build
   ```

3. **Commit and Push**
   ```bash
   git add .
   git commit -m "docs: update documentation"
   git push origin main
   ```

4. **Automatic Deployment**
   - GitHub Actions automatically detects changes
   - Validates documentation structure
   - Builds and deploys to gh-pages
   - No manual intervention needed

### For New Documentation Pages

1. **Add to VitePress Config**
   ```javascript
   // apps/docs/.vitepress/config.js
   sidebar: {
     '/section/': [
       {
         text: 'Group Name',
         items: [
           { text: 'Page Title', link: '/section/page-name' }
         ]
       }
     ]
   }
   ```

2. **Create Markdown File**
   ```bash
   # File must match the link path
   touch apps/docs/section/page-name.md
   ```

3. **Add Content**
   ```markdown
   # Page Title
   
   Content here...
   ```

4. **Validate and Deploy**
   ```bash
   npm run validate  # Check structure
   npm run build     # Build and check links
   git add . && git commit -m "docs: add new page"
   git push origin main
   ```

## Validation System

### Pre-build Validation

The validation system checks:

- ✅ All sidebar links have corresponding markdown files
- ✅ All required core documentation files exist
- ✅ Markdown files are not empty
- ✅ Internal links point to existing files
- ⚠️ TODO/FIXME markers
- ⚠️ Missing H1 titles

### Post-build Validation

After building, the system checks:

- ✅ All HTML links resolve to existing files
- ✅ Asset references are valid
- ✅ Navigation links work correctly

## Common Issues and Solutions

### Issue: "Missing file for sidebar link"

**Problem**: Sidebar in VitePress config references a file that doesn't exist.

**Solution**: 
1. Create the missing markdown file
2. Or remove the link from the sidebar config

### Issue: "Broken internal link"

**Problem**: Markdown file links to a page that doesn't exist.

**Solution**:
1. Create the target page
2. Fix the link path
3. Remove the broken link

### Issue: "Build directory not found"

**Problem**: VitePress build failed or output directory missing.

**Solution**:
1. Check VitePress configuration
2. Ensure all dependencies are installed
3. Run `npm run build` manually to see errors

### Issue: "Deployment failed"

**Problem**: GitHub Actions deployment failed.

**Solution**:
1. Check GitHub Actions logs
2. Fix validation errors
3. Ensure all files are committed to main branch

## Manual Deployment (Fallback)

If GitHub Actions fails, use the manual deployment script:

```bash
# From project root
./scripts/deploy-docs.sh
```

This script:
- Validates documentation
- Builds static files
- Deploys to gh-pages branch
- Includes safety checks

## File Structure

```
DataPrism/
├── .github/
│   └── workflows/
│       └── deploy-docs.yml          # GitHub Actions workflow
├── apps/
│   └── docs/
│       ├── .vitepress/
│       │   ├── config.js           # VitePress configuration
│       │   └── dist/               # Build output (generated)
│       ├── scripts/
│       │   ├── validate-docs.js    # Validation script
│       │   └── check-links.js      # Link checker
│       ├── package.json            # Dependencies and scripts
│       ├── index.md                # Home page
│       ├── guide/                  # Guide documentation
│       ├── api/                    # API documentation
│       ├── plugins/                # Plugin documentation
│       └── examples/               # Example documentation
├── scripts/
│   └── deploy-docs.sh              # Manual deployment script
└── DOCUMENTATION.md                # This file
```

## Required Files

The validation system expects these files to exist:

### Core Pages
- `index.md` - Home page
- `guide/index.md` - Guide overview
- `api/index.md` - API overview
- `plugins/index.md` - Plugin overview
- `examples/index.md` - Examples overview

### Guide Pages
- `guide/getting-started.md`
- `guide/installation.md`
- `guide/quick-start.md`
- `guide/architecture.md`
- `guide/wasm-engine.md`
- `guide/duckdb.md`
- `guide/llm.md`
- `guide/performance.md`
- `guide/security.md`
- `guide/troubleshooting.md`

### Plugin Pages
- `plugins/architecture.md`
- `plugins/getting-started.md`
- `plugins/development.md`
- `plugins/api.md`
- `plugins/testing.md`
- `plugins/out-of-box/index.md`
- `plugins/out-of-box/observable-charts.md`
- `plugins/out-of-box/csv-importer.md`
- `plugins/out-of-box/semantic-clustering.md`
- `plugins/out-of-box/performance-monitor.md`
- `plugins/ai-generator/index.md`

### API Pages
- `api/core.md`
- `api/orchestration.md`
- `api/plugins.md`

### Example Pages
- `examples/basic.md`
- `examples/advanced.md`
- `examples/plugins.md`

## Scripts Reference

### npm scripts (in apps/docs/)

```bash
npm run dev           # Start development server
npm run build         # Build static files (includes validation)
npm run validate      # Validate documentation structure
npm run check-links   # Check for broken links in built HTML
npm run preview       # Preview built documentation
```

### Shell scripts

```bash
./scripts/deploy-docs.sh    # Manual deployment to GitHub Pages
```

## GitHub Actions

The workflow runs on:
- Push to main branch (changes to `apps/docs/` directory)
- Pull requests to main branch
- Manual trigger (`workflow_dispatch`)

Steps:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Validate documentation
5. Build documentation
6. Check links
7. Deploy to GitHub Pages (main branch only)

## Benefits of New Process

1. **Automated Deployment**: No manual synchronization needed
2. **Validation**: Catches errors before deployment
3. **Consistency**: Same process every time
4. **Error Prevention**: Validates links and file structure
5. **Rollback**: Easy to revert problematic changes
6. **Parallel Development**: Multiple people can work on docs simultaneously

## Migration from Old Process

The old manual deployment process had these issues:
- Manual synchronization between main and gh-pages
- Inconsistent build outputs
- Missing file validation
- Force pushes overwriting changes
- No automated testing

The new process eliminates all these issues through automation and validation.

## Troubleshooting

### GitHub Actions not triggering

Check:
- Changes are in `apps/docs/` directory
- Workflow file is in `.github/workflows/`
- Branch is `main` (not `master`)

### Validation failing

Check:
- All sidebar links have corresponding files
- No broken internal links
- All required files exist
- Markdown files are not empty

### Build failing

Check:
- VitePress configuration is valid
- All dependencies are installed
- No syntax errors in markdown files

### Deployment failing

Check:
- GitHub Actions has write permissions
- No conflicts with existing gh-pages branch
- All files are committed to main branch

## Support

For issues with the documentation system:
1. Check GitHub Actions logs
2. Run validation locally: `npm run validate`
3. Test build locally: `npm run build`
4. Use manual deployment as fallback
5. Open issue in GitHub repository