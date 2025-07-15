# GitHub Pages Jekyll Configuration Fix

## Problem

The DataPrism CDN deployment to GitHub Pages was experiencing 404 errors because Jekyll (GitHub Pages' default static site generator) wasn't processing the files correctly. This was a recurring issue that happened every time a new deployment was triggered.

## Root Cause

1. **GitHub Actions Workflow**: The CDN deployment workflow uses `force_orphan: true` in the `peaceiris/actions-gh-pages@v3` action
2. **Branch Overwrite**: This completely overwrites the `gh-pages` branch on every deployment
3. **Missing Jekyll Config**: Without proper Jekyll configuration files, Jekyll doesn't know how to process the static assets
4. **404 Result**: Jekyll excludes or doesn't properly serve the files, resulting in 404 errors

## Solution

### 1. Jekyll Template Files

Created template files in `tools/build/jekyll-templates/`:

- **`_config.yml`**: Jekyll configuration that tells it to include all necessary assets
- **`.nojekyll`**: Alternative option to disable Jekyll entirely (kept for fallback)
- **`index.html`**: Landing page with Jekyll front matter for proper processing

### 2. Vite Plugin

Created `tools/build/jekyll-plugin.js` that:

- Runs during the CDN build process
- Copies Jekyll configuration files to the build output
- Only runs for GitHub Pages deployments
- Ensures the fix is applied on every deployment

### 3. Build Integration

Updated `tools/build/vite.config.ts` to:

- Import and use the Jekyll plugin
- Only enable it for `github-pages` CDN target
- Configure proper output directory

## Configuration Details

### Jekyll Config (`_config.yml`)

```yaml
# GitHub Pages Jekyll Configuration for DataPrism CDN
plugins: ["jekyll-gist"]
include: ["_*",".nojekyll","*.js","*.map","*.json","assets/**/*"]
exclude: ["node_modules/","Gemfile*","test-results/","packages/"]
markdown: kramdown
highlighter: rouge
sass:
  sass_dir: _sass
  style: compressed
```

Key settings:
- **`include`**: Explicitly includes all asset types that Jekyll might otherwise ignore
- **`exclude`**: Excludes development/build artifacts that shouldn't be served
- **`plugins`**: Basic Jekyll functionality for GitHub Pages

### Index.html Front Matter

```html
---
layout: null
---
<!DOCTYPE html>
```

The front matter tells Jekyll to process the file but not apply any layout templates.

## Why This Works

1. **Automatic Inclusion**: The Vite plugin ensures Jekyll config is included in every deployment
2. **Proper Processing**: Jekyll now knows how to handle JavaScript, JSON, and other asset files
3. **No Manual Intervention**: Developers don't need to manually fix the `gh-pages` branch after deployments
4. **Source Control**: The fix is version-controlled and part of the build process

## Testing the Fix

After deployment, verify:

1. **Main URL**: `https://srnarasim.github.io/DataPrism/` should return the landing page
2. **Assets**: Individual assets like `/dataprism.min.js` should be accessible
3. **Manifest**: `/manifest.json` should be available
4. **No 404s**: All CDN resources should be served correctly

## Maintenance

- **Template Updates**: Modify files in `tools/build/jekyll-templates/` to change Jekyll behavior
- **Plugin Config**: Adjust settings in `vite.config.ts` if needed
- **Debugging**: Check GitHub Actions logs for Jekyll plugin output

## Alternative Approaches Considered

1. **Disable Jekyll**: Using only `.nojekyll` file (less control over processing)
2. **Manual Branch Management**: Manually maintaining `gh-pages` branch (not scalable)
3. **Different CDN Provider**: Moving away from GitHub Pages (unnecessary complexity)

The current solution provides the best balance of automation, control, and maintainability.