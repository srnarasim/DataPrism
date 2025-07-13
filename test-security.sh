#!/bin/bash

# Security Testing Script - Test security checks locally

echo "🔒 Testing Security Checks Locally"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo ""
    echo -e "${BLUE}🔍 $1${NC}"
    echo "--------------------------------"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. NPM Security Audit
print_step "NPM Security Audit"
if npm audit --audit-level high; then
    print_success "NPM audit passed"
else
    print_error "NPM audit found vulnerabilities"
fi

# 2. Rust Security Audit
print_step "Rust Security Audit"
if command -v cargo-audit >/dev/null 2>&1; then
    cd packages/core
    if cargo audit; then
        print_success "Rust audit passed"
    else
        print_error "Rust audit found vulnerabilities"
    fi
    cd ../..
else
    echo "Installing cargo-audit..."
    cargo install cargo-audit --quiet
    cd packages/core
    if cargo audit; then
        print_success "Rust audit passed"
    else
        print_error "Rust audit found vulnerabilities"
    fi
    cd ../..
fi

# 3. Secret Scanning (Basic)
print_step "Basic Secret Scanning"
SECRET_FOUND=false

# Check for common secret patterns
if grep -r -i "password\s*=" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=target >/dev/null 2>&1; then
    print_error "Potential password found in code"
    SECRET_FOUND=true
fi

if grep -r -i "api[_-]key\s*=" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=target >/dev/null 2>&1; then
    print_error "Potential API key found in code"
    SECRET_FOUND=true
fi

if [ "$SECRET_FOUND" = false ]; then
    print_success "No obvious secrets found"
fi

# 4. WASM Binary Size Check
print_step "WASM Binary Size Check"
if [ -f "packages/core/pkg/dataprism_core_bg.wasm" ]; then
    WASM_SIZE=$(stat -c%s packages/core/pkg/dataprism_core_bg.wasm 2>/dev/null || stat -f%z packages/core/pkg/dataprism_core_bg.wasm 2>/dev/null)
    WASM_SIZE_KB=$((WASM_SIZE / 1024))
    
    echo "WASM binary size: ${WASM_SIZE_KB}KB"
    
    if [ $WASM_SIZE_KB -lt 10240 ]; then  # Less than 10MB
        print_success "WASM binary size is reasonable (${WASM_SIZE_KB}KB)"
    else
        print_error "WASM binary is too large (${WASM_SIZE_KB}KB)"
    fi
else
    echo "⚠️  WASM binary not found - run build first"
fi

# 5. License Check
print_step "License Validation"
if command -v license-checker >/dev/null 2>&1; then
    if license-checker --summary >/dev/null 2>&1; then
        print_success "License check passed"
    else
        print_error "License check found issues"
    fi
else
    echo "⚠️  license-checker not available"
fi

echo ""
echo "=================================="
echo "🔒 Security Testing Complete"
echo "=================================="
echo ""
echo "💡 To run full security scans:"
echo "  - Install semgrep: python3 -m pip install semgrep"
echo "  - Run: semgrep --config=auto ."
echo "  - Install bandit: pip install bandit[toml]"
echo "  - Run: bandit -r ."