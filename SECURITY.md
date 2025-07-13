# Security Policy

## Supported Versions

We actively support the following versions of DataPrism Core with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in DataPrism Core, please report it responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send a report to: security@dataprism.dev

Include the following information in your report:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes or mitigations

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 24 hours.
- **Assessment**: We will assess the vulnerability and determine its severity within 72 hours.
- **Updates**: We will provide regular updates on our progress toward fixing the vulnerability.
- **Resolution**: We aim to resolve critical vulnerabilities within 7 days and other vulnerabilities within 30 days.

### Security Considerations

DataPrism Core is designed with security in mind:

- **WebAssembly Sandboxing**: Core computational logic runs in WebAssembly, providing memory safety
- **Input Validation**: All data inputs are validated before processing
- **Dependency Management**: We regularly audit and update dependencies
- **Browser Security**: Follows modern browser security practices including CSP headers

### Scope

This security policy covers:

- DataPrism Core WebAssembly engine
- JavaScript orchestration layer
- Plugin system and security boundaries
- Build tools and distribution packages

### Out of Scope

- Third-party plugins not developed by the DataPrism team
- Issues in dependencies that don't affect DataPrism Core
- Social engineering attacks
- Physical security

## Security Updates

Security updates will be released as patch versions and communicated through:

- GitHub Security Advisories
- Release notes
- NPM package updates

## Contact

For security-related questions or concerns, contact us at security@dataprism.dev.