# DataPrism Repository Protection Guide

## Overview

This guide documents the comprehensive repository protection strategy implemented for DataPrism Core, using GitHub's advanced repository rulesets to ensure security, code quality, and development workflow efficiency.

## Protection Strategy Overview

The DataPrism repository protection strategy implements a multi-layered security approach with three primary rulesets:

1. **Main Branch Protection** - Comprehensive protection for the main branch
2. **Push Protection** - Repository-wide protection against sensitive files and oversized artifacts
3. **Development Workflow** - Streamlined protection for development branches

## Rulesets Configuration

### 1. Main Branch Protection Ruleset

**Target:** `main` branch  
**Enforcement:** Active  
**Purpose:** Ensure all changes to main branch are reviewed and tested

#### Rules Applied:
- **Pull Request Reviews**: 2 required approvals
- **Status Checks**: All CI/CD tests must pass
- **Linear History**: Enforce clean commit history
- **Signed Commits**: Require GPG/SSH signature verification
- **Non-Fast-Forward**: Prevent force pushes

#### Required Status Checks:
- `test:all` - Complete test suite
- `lint:rust` - Rust code linting
- `lint:ts` - TypeScript code linting  
- `validate:security` - Security validation
- `size-check:packages` - Package size validation

### 2. Push Protection Ruleset

**Target:** All branches  
**Enforcement:** Active  
**Purpose:** Prevent sensitive data commits and oversized files

#### Protected File Patterns:
```
**/.env*                 # Environment files
**/secrets/**           # Secrets directory
**/*.key                # Private keys
**/*.pem                # PEM certificates
**/*.p12                # PKCS#12 files
**/*.pfx                # PFX files
**/id_rsa*              # SSH keys
**/credentials*         # Credential files
**/config/database.yml  # Database config
**/config/production.yml # Production config
```

#### File Size Limits:
- **WASM Files**: 6MB maximum (per architecture requirements)
- **General Files**: 100MB maximum

#### Restricted Extensions:
- `.key`, `.pem`, `.p12`, `.pfx`, `.keystore`, `.jks`

### 3. Development Workflow Ruleset

**Target:** Development branches (`develop/*`, `feature/*`, `hotfix/*`, `bugfix/*`)  
**Enforcement:** Active  
**Purpose:** Balance security with development velocity

#### Rules Applied:
- **Required Status Checks**: Core tests and linting
- **Branch Updates**: Allow fetch and merge updates
- **Force Push**: Permitted for development branches

#### Required Status Checks:
- `test:core` - Core functionality tests
- `lint:rust` - Rust code linting
- `lint:ts` - TypeScript code linting

## Security Features Integration

### GitHub Native Security Features

The following GitHub security features are enabled:

- **Vulnerability Alerts**: Automatic notifications for known vulnerabilities
- **Automated Security Fixes**: Dependabot security updates
- **Dependency Graph**: Dependency vulnerability tracking
- **Secret Scanning**: Automatic detection of committed secrets

### DataPrism-Specific Security

- **WebAssembly File Size Enforcement**: Prevents oversized WASM modules
- **Build Artifact Protection**: Prevents accidental commit of compiled artifacts
- **Configuration File Protection**: Blocks sensitive configuration files

## Developer Workflow

### Contributing to Main Branch

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop and Test**
   ```bash
   # Make your changes
   npm run test:core
   npm run lint
   ```

3. **Create Pull Request**
   - All status checks must pass
   - 2 code reviews required
   - Signed commits required

4. **Merge Requirements**
   - Linear history maintained
   - Stale reviews dismissed on updates
   - All conversations resolved

### Development Branch Workflow

1. **Create Development Branch**
   ```bash
   git checkout -b develop/experimental-feature
   ```

2. **Relaxed Requirements**
   - Core tests must pass
   - Linting required
   - Force push allowed
   - Single reviewer sufficient

### Emergency Procedures

#### Bypass Permissions

**Organization Admins** can bypass rulesets in emergency situations:
- Main branch protection: Always bypass
- Push protection: Pull request bypass only
- Development workflow: Always bypass

#### Emergency Rollback

If rulesets block legitimate work:

1. **Immediate Rollback**
   ```bash
   node tools/security/repository-protection.js rollback
   ```

2. **Temporary Bypass**
   - Contact repository administrator
   - Request temporary rule suspension
   - Document reason and duration

## File Size Guidelines

### WebAssembly Files

- **Maximum Size**: 6MB per file
- **Rationale**: Browser memory optimization
- **Enforcement**: Automatic push blocking

### General Files

- **Maximum Size**: 100MB per file
- **Rationale**: Repository performance
- **Enforcement**: Automatic push blocking

## Testing and Validation

### Automated Testing

Run the validation suite:
```bash
node tools/security/protection-validator.js
```

### Manual Testing

1. **Test Sensitive File Blocking**
   ```bash
   # This should be blocked
   echo "SECRET_KEY=test123" > .env
   git add .env && git commit -m "test" && git push
   ```

2. **Test File Size Limits**
   ```bash
   # Create large file (should be blocked)
   dd if=/dev/zero of=large.wasm bs=1M count=7
   git add large.wasm && git commit -m "test" && git push
   ```

3. **Test PR Requirements**
   - Create PR without required reviews
   - Attempt to merge without status checks
   - Try to push directly to main

## Monitoring and Alerts

### GitHub Insights

Monitor repository protection effectiveness:
- **Security Tab**: View security alerts and scanning results
- **Insights Tab**: Track rule enforcement and bypass events
- **Actions Tab**: Monitor status check performance

### Custom Monitoring

The protection system provides:
- Real-time rule enforcement logging
- Performance metrics for ruleset evaluation
- Bypass event tracking and reporting

## Performance Characteristics

### Ruleset Evaluation Performance

- **Target**: < 2 seconds per push
- **Actual**: Typically < 500ms
- **Monitoring**: Automated performance tracking

### Status Check Performance

- **Target**: < 10 minutes completion
- **Typical**: 3-5 minutes for full suite
- **Optimization**: Parallel execution where possible

## Troubleshooting

### Common Issues

#### 1. Status Check Failures

**Symptom**: PR blocked by failing status checks
**Solution**: 
```bash
# Run checks locally
npm run test:all
npm run lint
npm run validate:security
```

#### 2. File Size Violations

**Symptom**: Push blocked due to file size
**Solution**:
- Optimize WASM build settings
- Use Git LFS for large assets
- Split large files into smaller modules

#### 3. Sensitive File Detection

**Symptom**: Push blocked due to sensitive file patterns
**Solution**:
- Review file patterns in `.gitignore`
- Use environment variable injection
- Store secrets in GitHub Secrets

### Getting Help

1. **Check Validation Report**
   ```bash
   node tools/security/protection-validator.js
   ```

2. **Review Protection Rules**
   ```bash
   gh api repos/srnarasim/DataPrism/rulesets
   ```

3. **Contact Repository Administrators**
   - Repository owner: @srnarasim
   - Security team: security@dataprism.dev

## Best Practices

### For Developers

1. **Before Committing**
   - Run local tests and linting
   - Check file sizes and patterns
   - Verify commit signatures

2. **Creating Pull Requests**
   - Write clear PR descriptions
   - Ensure all checks pass
   - Request appropriate reviewers

3. **Handling Secrets**
   - Never commit secrets to repository
   - Use environment variables
   - Leverage GitHub Secrets for CI/CD

### For Administrators

1. **Ruleset Management**
   - Regular review of ruleset effectiveness
   - Performance monitoring
   - Update rules based on team feedback

2. **Security Monitoring**
   - Review security alerts regularly
   - Monitor bypass events
   - Conduct periodic security audits

## Compliance and Auditing

### Audit Trail

All repository protection events are logged:
- Ruleset enforcement actions
- Bypass events and justifications
- Security scanning results
- Configuration changes

### Compliance Reporting

Monthly compliance reports include:
- Protection effectiveness metrics
- Security incident summaries
- Performance statistics
- Recommendations for improvement

## Future Enhancements

### Planned Features

1. **Advanced File Analysis**
   - Content-based secret detection
   - Binary file validation
   - Dependency vulnerability scanning

2. **Integration Improvements**
   - Slack notifications for violations
   - Automated incident response
   - Custom status check integrations

3. **Performance Optimizations**
   - Parallel rule evaluation
   - Caching for repeated checks
   - Reduced API call overhead

### Contributing to Protection Strategy

To suggest improvements or report issues:

1. **Create Issue**: Document the problem or enhancement request
2. **Security Review**: Ensure changes maintain security posture
3. **Test Implementation**: Validate changes don't break workflows
4. **Documentation**: Update relevant documentation

## Summary

The DataPrism repository protection strategy provides comprehensive security while maintaining developer productivity. The multi-layered approach ensures sensitive data protection, code quality enforcement, and streamlined development workflows.

For questions or issues, refer to the troubleshooting section or contact the repository administrators.