# Contributing to DataPrism Core

We love your input! We want to make contributing to DataPrism Core as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/dataprism-core.git
   cd dataprism-core
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
5. **Make your changes** and test them
6. **Submit a pull request**

## 🛠️ Development Process

We use GitHub to host code, track issues and feature requests, and accept pull requests.

### Development Workflow

1. **Issues First**: For significant changes, please open an issue first to discuss what you would like to change
2. **Branch Naming**: Use descriptive branch names:
   - `feature/add-csv-export`
   - `fix/memory-leak-in-query-engine`
   - `docs/update-api-reference`
3. **Commits**: Use clear and meaningful commit messages following [Conventional Commits](https://conventionalcommits.org/)
4. **Testing**: Ensure all tests pass and add tests for new functionality
5. **Pull Request**: Open a pull request with a clear description of changes

### Commit Message Format

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(core): add CSV export functionality
fix(orchestration): resolve memory leak in query execution
docs(api): update DataPrismEngine documentation
```

## 🧪 Testing

We maintain high test coverage and require tests for all new functionality.

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:core          # Rust unit tests
npm run test:orchestration # TypeScript unit tests
npm run test:browser       # Browser integration tests
npm run test:performance   # Performance benchmarks

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **Browser Tests**: Test WebAssembly functionality across browsers
- **Performance Tests**: Ensure performance targets are met

### Test Guidelines

1. **Test Coverage**: Aim for >90% test coverage
2. **Test Names**: Use descriptive test names that explain what is being tested
3. **Test Structure**: Follow Arrange-Act-Assert pattern
4. **Mock Dependencies**: Mock external dependencies appropriately
5. **Performance Tests**: Include performance tests for critical paths

## 🎯 Code Quality

We maintain high code quality standards through automated tooling and manual review.

### Code Style

- **TypeScript**: We use ESLint and Prettier for TypeScript code
- **Rust**: We use rustfmt and clippy for Rust code
- **Configuration**: All configuration is in the repository

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New functionality includes tests
- [ ] Documentation is updated
- [ ] Performance impact is considered
- [ ] Security implications are reviewed
- [ ] Breaking changes are documented

## 📚 Documentation

Good documentation is crucial for project success.

### Documentation Guidelines

1. **API Documentation**: Use TSDoc for TypeScript and rustdoc for Rust
2. **Examples**: Include practical examples in documentation
3. **Changelog**: Update CHANGELOG.md for user-facing changes
4. **README**: Keep README.md up to date with new features

### Building Documentation

```bash
# Build API documentation
npm run generate:api

# Build and serve documentation locally
npm run dev:docs

# Build documentation for deployment
npm run build:docs
```

## 🏗️ Architecture Guidelines

Understanding the architecture helps you contribute effectively.

### Project Structure

```
dataprism-core/
├── packages/           # Core packages
│   ├── core/          # Rust WASM engine
│   ├── orchestration/ # TypeScript orchestration
│   ├── plugins/       # Plugin framework
│   └── cli/           # CLI tools
├── apps/              # Applications
│   ├── demo-analytics/ # Demo application
│   └── docs/          # Documentation site
├── tools/             # Build tools and scripts
├── tests/             # Test suites
└── .github/           # GitHub workflows
```

### Design Principles

1. **Performance First**: Optimize for analytical workloads
2. **Browser Native**: Leverage modern browser capabilities
3. **Type Safety**: Use TypeScript for better developer experience
4. **Memory Efficiency**: Manage memory carefully for large datasets
5. **Extensibility**: Design for plugin architecture
6. **Security**: Follow security best practices

### Adding New Features

When adding new features:

1. **Design Document**: For significant features, create a design document
2. **API Design**: Design APIs to be intuitive and consistent
3. **Performance**: Consider performance implications
4. **Testing**: Include comprehensive tests
5. **Documentation**: Document new APIs and usage patterns

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/dataprism/core/issues).

### Bug Report Template

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.

## 💡 Feature Requests

We love feature requests! Please [open an issue](https://github.com/dataprism/core/issues) with:

1. **Use Case**: Describe your use case and why this feature would be valuable
2. **Proposed Solution**: If you have ideas on how to implement it
3. **Alternatives**: Any alternative solutions you've considered
4. **Impact**: Who would benefit from this feature

## 🔒 Security

Security is paramount for DataPrism Core. Please see our [Security Policy](./SECURITY.md) for reporting security issues.

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

We want everyone to feel welcome in our community. Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## 🎉 Recognition

We believe in recognizing contributors:

- **Contributors**: Listed in our README
- **Major Contributors**: Special recognition in releases
- **Core Team**: Invitation to join the core team for significant contributions

## 📞 Getting Help

If you need help contributing:

- **GitHub Discussions**: Ask questions in [GitHub Discussions](https://github.com/dataprism/core/discussions)
- **Discord**: Join our [Discord community](https://discord.gg/dataprism)
- **Email**: Contact us at [contributors@dataprism.dev](mailto:contributors@dataprism.dev)

## 🚀 First Time Contributors

New to open source? Here are some good first issues:

- [Good First Issues](https://github.com/dataprism/core/labels/good%20first%20issue)
- [Documentation](https://github.com/dataprism/core/labels/documentation)
- [Help Wanted](https://github.com/dataprism/core/labels/help%20wanted)

## 📋 Contribution Checklist

Before submitting your contribution:

- [ ] Fork the repository
- [ ] Create a feature branch from `main`
- [ ] Make your changes
- [ ] Add tests for new functionality
- [ ] Run the test suite (`npm test`)
- [ ] Update documentation
- [ ] Update CHANGELOG.md if needed
- [ ] Commit with conventional commit format
- [ ] Push to your fork
- [ ] Open a pull request

Thank you for contributing to DataPrism Core! 🎉