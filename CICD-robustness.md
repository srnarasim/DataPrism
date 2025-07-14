# DataPrism CI/CD Robustness PRP Template

This Product Requirements Prompt (PRP) template is designed to systematically address the build, test, and deployment gaps identified in the DataPrism repository. Use this as a foundation to harden the CI/CD pipeline, minimize failures, and ensure reliable, maintainable delivery.

---

## 1. Objective

Enhance the resilience and reliability of the DataPrism CI/CD pipeline by addressing recent failure patterns, enforcing best practices, and establishing automated safeguards for all build, test, and deployment stages.

---

## 2. Scope

- Applies to all CI/CD workflows: build, test, deploy, and rollback.
- Covers local and remote (CI) environments.
- Includes dependency management, environment configuration, code quality, and secret handling.

---

## 3. Requirements

### 3.1 Automated Testing

- All PRs and merges must pass unit, integration, and end-to-end tests.
- Flaky or intermittent tests must be isolated, stabilized, or marked as quarantined.
- External dependencies in tests must be mocked or stubbed.
- Test retries enabled for known intermittent failures, with reporting for persistent issues.

### 3.2 Dependency and Build Management

- Use lock files (`package-lock.json`, `Cargo.lock`) and enforce their presence in CI.
- Pin all tool and dependency versions; update only via controlled PRs.
- Validate build scripts on every commit.
- Cache dependencies and build artifacts to speed up pipelines.
- Containerize build/test environments (e.g., Docker) for consistency.

### 3.3 Environment and Configuration Validation

- All required environment variables and secrets must be validated before any job runs.
- Provide safe defaults where possible; fail fast on missing or misconfigured variables.
- Lint and validate all CI/CD YAML and configuration files before execution.

### 3.4 Pipeline Optimization

- Run independent jobs (build, test, lint) in parallel.
- Build artifacts once and reuse in downstream jobs.
- Keep pipeline duration under 15 minutes for typical changes.

### 3.5 Code Quality and Review

- Require passing CI and code reviews before merging to main.
- Enforce commit message and branch naming conventions.
- Block merges on failing or flaky tests.

### 3.6 Security and Secrets Management

- Store all credentials in a secure secret manager; never expose in logs.
- Validate secrets before deployment steps.
- Scan for secrets and vulnerabilities as part of the pipeline.

### 3.7 Deployment and Rollback

- Deployment scripts must be idempotent and support safe repeated execution.
- Automated rollback or manual revert procedures for failed deployments.
- Abort deployment if any required secret or credential is missing.

### 3.8 Monitoring and Feedback

- Integrate monitoring and alerting for build, test, and deployment failures.
- Provide actionable, structured error messages in CI logs.
- Track metrics: build time, failure rates, test duration, deployment frequency.

---

## 4. Quality Assurance

- Automated tests for all pipeline scripts and custom tooling.
- Nightly or weekly full pipeline runs with all plugins/extensions enabled.
- Post-mortem analysis for every critical CI/CD failure.
- Documentation and onboarding guides for running CI/CD locally and in CI.

---

## 5. Success Criteria

- >95% build success rate on main branch over 30 days.
- All merges require green builds and passing tests.
- Mean time to recovery (MTTR) for pipeline failures is under 1 hour.
- Developers can reproduce CI failures locally using documented scripts.

---

## 6. Example Mapping Table

| Observed Failure             | Requirement Addressed                                                    |
|------------------------------|--------------------------------------------------------------------------|
| Flaky/intermittent tests     | Test stabilization, retries, mocks, green build enforcement              |
| Build script errors          | Version pinning, lock files, script validation                           |
| Env var/config errors        | Pre-job validation, safe defaults, fail-fast behavior                    |
| Pipeline config mistakes     | Linting and validation of all pipeline configs before execution          |
| Deployment/secret failures   | Secure secret management, pre-deploy validation                          |
| Long build/test times        | Caching, parallelization, artifact reuse                                 |

---

## 7. How to Use This PRP

1. Copy this template into your `/PRPs` directory.
2. Edit each section to reflect your project’s specifics and CI/CD tooling.
3. Submit to your context engineering workflow (e.g., `/generate-prp ci-robustness.md`).
4. Iterate based on feedback and implementation outcomes.

---

This PRP ensures DataPrism’s CI/CD pipeline is robust, maintainable, and ready for reliable scaling by directly addressing the failure patterns observed in recent repository activity.

