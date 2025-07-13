# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of DataPrism Core:

| Version | Supported          | End of Support |
| ------- | ------------------ | -------------- |
| 1.x.x   | :white_check_mark: | TBD            |
| 0.x.x   | :x:                | 2024-12-31     |

## Reporting a Vulnerability

We take the security of DataPrism Core seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Reporting Process

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@dataprism.dev**

Include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

We will acknowledge receipt of your vulnerability report within **48 hours** and will send a more detailed response within **7 days** indicating the next steps in handling your report.

After the initial reply, we will:

- Confirm the problem and determine the affected versions
- Audit code to find any potential similar problems
- Prepare fixes for all supported versions
- Release security updates as soon as possible

### Disclosure Policy

We follow the principle of **coordinated disclosure**:

1. **Investigation**: We investigate and validate the reported vulnerability
2. **Fix Development**: We develop and test fixes for all supported versions
3. **Security Advisory**: We prepare a security advisory with details about the vulnerability
4. **Release**: We release patched versions and publish the security advisory
5. **Public Disclosure**: Full details are disclosed after fixes are available

We aim to complete this process within **90 days** of the initial report, but complex issues may take longer.

### Security Updates

Security updates are published through:

- **GitHub Security Advisories**: Primary source for security notifications
- **NPM Security Advisories**: Automatically published for NPM packages
- **Release Notes**: Security fixes are clearly marked in release notes
- **Security Mailing List**: Subscribe at security-announcements@dataprism.dev

### Security Best Practices

When using DataPrism Core, please follow these security best practices:

#### Content Security Policy (CSP)

Configure proper CSP headers to protect against XSS attacks:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'self' https://cdn.dataprism.dev;
```

#### Cross-Origin Headers

DataPrism Core requires specific headers for WebAssembly functionality:

```http
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

#### Input Validation

Always validate and sanitize data before processing:

```typescript
// Good: Validate data before loading
const isValidData = data.every(
  (row) =>
    typeof row === "object" &&
    Object.keys(row).every((key) => typeof key === "string"),
);

if (isValidData) {
  await engine.loadData(data, "table_name");
}

// Good: Use parameterized queries
const result = await engine.query("SELECT * FROM users WHERE id = ?", [userId]);
```

#### Memory Management

Monitor memory usage to prevent DoS attacks:

```typescript
const engine = new DataPrismEngine({
  memoryLimit: "512MB", // Set appropriate limits
  queryTimeout: 30000, // Prevent long-running queries
});

// Monitor memory usage
const metrics = await engine.getMetrics();
if (metrics.memoryUsage > MEMORY_THRESHOLD) {
  // Take appropriate action
}
```

#### Data Privacy

DataPrism Core processes data locally, but ensure proper handling:

- **Sensitive Data**: Be cautious when processing sensitive data
- **Logging**: Avoid logging sensitive information
- **Error Messages**: Don't expose sensitive data in error messages
- **Browser Storage**: Clear sensitive data when no longer needed

### Known Security Considerations

#### WebAssembly Security

- DataPrism Core uses WebAssembly which runs in a sandboxed environment
- WASM binaries are signed and include integrity hashes
- All WASM files are served with proper MIME types and security headers

#### Dependency Security

- We regularly audit dependencies for known vulnerabilities
- Automated security updates are enabled via Dependabot
- Supply chain security is monitored using OSV Scanner and npm audit

#### Browser Compatibility

- Security features may vary across browsers
- WebAssembly support is required for core functionality
- Some security features (like COOP/COEP) may not be supported in older browsers

### Security Testing

We maintain comprehensive security testing:

- **Static Analysis**: ESLint security rules, Semgrep, CodeQL
- **Dependency Scanning**: npm audit, OSV Scanner, Snyk
- **Secret Scanning**: TruffleHog, GitLeaks
- **WASM Security**: Rust audit, cargo deny
- **Supply Chain**: SLSA provenance verification

### Security Contact

For general security questions (not vulnerabilities), contact:

- **Email**: security@dataprism.dev
- **GitHub Discussions**: [Security Category](https://github.com/dataprism/core/discussions/categories/security)

### Attribution

We believe in recognizing security researchers who help improve our security. With your permission, we will:

- Credit you in our security advisory
- List you in our security acknowledgments
- Provide a reference for your work (if desired)

### Legal

This security policy is subject to our [Terms of Service](https://dataprism.dev/terms) and [Privacy Policy](https://dataprism.dev/privacy).

We will not pursue legal action against security researchers who:

- Make a good faith effort to avoid privacy violations and service disruption
- Report vulnerabilities through the proper channels
- Avoid accessing or modifying data belonging to others
- Do not perform attacks that could harm the reliability of our services

---

**Last Updated**: 2024-01-15
**Version**: 1.0
