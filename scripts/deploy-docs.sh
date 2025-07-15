#!/bin/bash

# DataPrism Documentation Deployment Script
# This script is a fallback for manual deployment
# Primary deployment should use GitHub Actions

set -e

echo "📚 DataPrism Documentation Deployment"
echo "⚠️  Note: This is a fallback script. Consider using GitHub Actions for automated deployment."
echo ""

# Configuration
REPO_URL="https://github.com/srnarasim/DataPrism.git"
BRANCH="gh-pages"
DOCS_DIR="apps/docs"
BUILD_DIR="$DOCS_DIR/.vitepress/dist"
DEPLOY_DIR=".deploy-temp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "Please run this script from the DataPrism project root directory"
    exit 1
fi

# Check if documentation directory exists
if [ ! -d "$DOCS_DIR" ]; then
    log_error "Documentation directory not found: $DOCS_DIR"
    exit 1
fi

# Clean up any existing deployment directory
if [ -d "$DEPLOY_DIR" ]; then
    log_info "Cleaning up previous deployment directory..."
    rm -rf "$DEPLOY_DIR"
fi

# Validate and build documentation
log_step "Validating documentation..."
cd "$DOCS_DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm ci
fi

# Validate documentation structure
log_info "Running validation checks..."
npm run validate

# Build documentation
log_info "Building documentation..."
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    log_error "Build failed - output directory not found: $BUILD_DIR"
    exit 1
fi

# Check for build artifacts
if [ ! -f "$BUILD_DIR/index.html" ]; then
    log_error "Build failed - index.html not found in build directory"
    exit 1
fi

# Go back to project root
cd ..

# Create deployment directory
log_step "Preparing deployment..."
mkdir -p "$DEPLOY_DIR"

# Copy built documentation
log_info "Copying documentation build..."
cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"

# Navigate to deployment directory
cd "$DEPLOY_DIR"

# Initialize git repository
log_info "Initializing git repository..."
git init
git checkout -b "$BRANCH"

# Configure git user
git config user.name "DataPrism Deploy Bot"
git config user.email "deploy@dataprism.dev"

# Create .nojekyll file to disable Jekyll processing
log_info "Creating .nojekyll file..."
touch .nojekyll

# Add CNAME file if needed (uncomment if using custom domain)
# echo "docs.dataprism.dev" > CNAME

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
COMMIT_MSG="Deploy documentation - $(date -u +"%Y-%m-%d %H:%M:%S UTC")

🤖 Generated with deployment script

Source: $(git -C .. rev-parse HEAD)
Branch: $(git -C .. rev-parse --abbrev-ref HEAD)"

git commit -m "$COMMIT_MSG"

# Add remote and push
log_step "Deploying to GitHub Pages..."
git remote add origin "$REPO_URL"

# Force push to gh-pages branch
log_info "Pushing to GitHub Pages..."
git push --force origin "$BRANCH"

# Navigate back to project root
cd ..

# Clean up deployment directory
log_info "Cleaning up deployment directory..."
rm -rf "$DEPLOY_DIR"

# Success message
echo ""
log_info "✅ Documentation deployment completed successfully!"
log_info "📖 Documentation will be available at: https://srnarasim.github.io/DataPrism/"
log_info "⏳ GitHub Pages may take a few minutes to update"

echo ""
echo "🎉 Deployment Summary:"
echo "   Repository: srnarasim/DataPrism"
echo "   Branch: $BRANCH"
echo "   URL: https://srnarasim.github.io/DataPrism/"
echo "   Commit: $COMMIT_MSG"
echo ""
echo "💡 For automated deployment, consider using GitHub Actions:"
echo "   - Push changes to main branch"
echo "   - GitHub Actions will automatically deploy"
echo "   - No manual intervention required"