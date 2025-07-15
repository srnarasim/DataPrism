# Browser Testing Guide

DataPrism Core includes comprehensive browser testing to ensure WebAssembly functionality works across different browsers. However, these tests can be time-consuming, so we've made them optional and configurable.

## Test Scripts

### Quick Testing (Recommended for Development)

```bash
# Quick test - Chromium only, single worker, minimal output
npm run test:browser:quick

# Quick test with all other tests
npm run test:all:quick
```

### Standard Testing

```bash
# Full browser test suite (all browsers, may take 10-15 minutes)
npm run test:browser

# All tests including browser tests
npm run test:all

# Fast browser tests (4 workers, all browsers)
npm run test:browser:fast
```

### Selective Testing

```bash
# Chromium only
npm run test:browser:chromium

# Skip browser tests entirely
npm run test:browser:skip

# Standard test suite (no browser tests)
npm test
```

## Environment Variables

### Control Test Execution

- `SKIP_BROWSER_TESTS=true` - Skip all browser tests
- `BROWSER_TEST_QUICK=true` - Run only Chromium tests
- `BROWSER_TEST_WORKERS=N` - Set number of parallel workers

### Examples

```bash
# Skip browser tests in CI
SKIP_BROWSER_TESTS=true npm test

# Quick test with 2 workers
BROWSER_TEST_WORKERS=2 npm run test:browser:quick

# Full test suite but only Chromium
BROWSER_TEST_QUICK=true npm run test:browser
```

## Configuration Files

### `playwright.config.ts`
- Full browser test suite
- Tests Chrome, Firefox, Safari, Edge, and mobile browsers
- Configurable via environment variables

### `playwright.quick.config.ts`
- Optimized for development speed
- Chromium only
- Single worker
- Minimal output
- Shorter timeouts

## Test Performance

| Test Type | Duration | Browsers | Use Case |
|-----------|----------|----------|----------|
| `test:browser:quick` | 2-3 minutes | Chromium | Development |
| `test:browser:chromium` | 3-5 minutes | Chromium | Quick validation |
| `test:browser:fast` | 5-8 minutes | All | Pre-commit |
| `test:browser` | 10-15 minutes | All | Full validation |

## CI/CD Integration

### GitHub Actions

```yaml
# Quick browser tests
- name: Quick Browser Tests
  run: npm run test:browser:quick

# Full browser tests (optional)
- name: Full Browser Tests
  run: npm run test:browser
  if: github.event_name == 'pull_request'

# Skip browser tests in some workflows
- name: Unit Tests Only
  run: SKIP_BROWSER_TESTS=true npm test
```

### Local Development

```bash
# During development
npm run test:browser:quick

# Before committing
npm run test:all:quick

# Before releasing
npm run test:all
```

## Troubleshooting

### Tests Taking Too Long

1. Use `npm run test:browser:quick` for development
2. Set `BROWSER_TEST_WORKERS=1` for slower machines
3. Use `BROWSER_TEST_QUICK=true` to test only Chromium

### Test Failures

1. Check browser compatibility in `playwright.config.ts`
2. Verify WebAssembly support in target browsers
3. Review test output in `test-results/` directory

### Memory Issues

1. Reduce parallel workers: `BROWSER_TEST_WORKERS=1`
2. Use quick config: `npm run test:browser:quick`
3. Skip mobile tests by using Chromium only

## Best Practices

1. **Development**: Use `npm run test:browser:quick`
2. **Pre-commit**: Use `npm run test:all:quick`
3. **CI**: Use environment variables to control test execution
4. **Release**: Run full test suite with `npm run test:all`

## Adding New Tests

When adding new browser tests:

1. Keep tests focused and fast
2. Use appropriate timeouts
3. Test critical WebAssembly functionality
4. Consider mobile browser limitations
5. Add to both configs if needed

## Configuration Options

Browser tests can be configured via:

- Environment variables (runtime)
- Playwright config files (build-time)
- Package.json scripts (convenience)
- Command-line flags (ad-hoc)

Choose the method that best fits your workflow and CI/CD requirements.