#!/bin/bash

# DataPrism Documentation Deployment Script
# Deploys VitePress documentation to GitHub Pages

set -e

echo "📚 Starting DataPrism Documentation Deployment"

# Configuration
REPO_URL="https://github.com/srnarasim/DataPrism.git"
BRANCH="gh-pages"
DOCS_BUILD_DIR="apps/docs/.vitepress/dist"
DEPLOY_DIR=".deploy-temp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "Please run this script from the DataPrism project root directory"
    exit 1
fi

# Check if docs build directory exists
if [ ! -d "$DOCS_BUILD_DIR" ]; then
    log_error "Documentation build directory not found. Please run 'npm run build:docs' first"
    exit 1
fi

# Clean up any existing deployment directory
if [ -d "$DEPLOY_DIR" ]; then
    log_info "Cleaning up previous deployment directory..."
    rm -rf "$DEPLOY_DIR"
fi

# Create deployment directory
log_info "Creating deployment directory..."
mkdir -p "$DEPLOY_DIR"

# Copy documentation build to deployment directory
log_info "Copying documentation build..."
cp -r "$DOCS_BUILD_DIR"/* "$DEPLOY_DIR/"

# Navigate to deployment directory
cd "$DEPLOY_DIR"

# Initialize git repository
log_info "Initializing git repository..."
git init
git checkout -b "$BRANCH"

# Configure git user (using GitHub Actions bot)
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

# Create .nojekyll file to disable Jekyll processing
log_info "Creating .nojekyll file..."
touch .nojekyll

# Create docs subdirectory structure
log_info "Setting up documentation structure..."
mkdir -p docs

# Move all files to docs subdirectory except assets
mv *.html docs/ 2>/dev/null || true
mv *.css docs/ 2>/dev/null || true
mv *.json docs/ 2>/dev/null || true
mv api docs/ 2>/dev/null || true
mv examples docs/ 2>/dev/null || true
mv guide docs/ 2>/dev/null || true
mv plugins docs/ 2>/dev/null || true

# Keep assets at root level for proper path resolution
# (assets directory stays at root)

# Create index.html redirect at root
log_info "Creating root redirect..."
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DataPrism Documentation</title>
    <meta http-equiv="refresh" content="0; url=./docs/">
    <link rel="canonical" href="./docs/">
</head>
<body>
    <p>Redirecting to <a href="./docs/">DataPrism Documentation</a>...</p>
</body>
</html>
EOF

# Add all files
log_info "Adding files to git..."
git add .

# Check if there are any changes
if git diff --staged --quiet; then
    log_warn "No changes to deploy"
    cd ..
    rm -rf "$DEPLOY_DIR"
    exit 0
fi

# Commit changes
log_info "Committing changes..."
COMMIT_MSG="Deploy documentation - $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
git commit -m "$COMMIT_MSG"

# Add remote and push
log_info "Pushing to GitHub Pages..."
git remote add origin "$REPO_URL"
git push --force origin "$BRANCH"

# Navigate back to project root
cd ..

# Clean up deployment directory
log_info "Cleaning up deployment directory..."
rm -rf "$DEPLOY_DIR"

log_info "✅ Documentation deployment completed successfully!"
log_info "📖 Documentation will be available at: https://srnarasim.github.io/DataPrism/docs/"
log_info "⏳ GitHub Pages may take a few minutes to update"

echo ""
echo "🎉 Deployment Summary:"
echo "   Repository: srnarasim/DataPrism"
echo "   Branch: $BRANCH"
echo "   URL: https://srnarasim.github.io/DataPrism/docs/"
echo "   Commit: $COMMIT_MSG"