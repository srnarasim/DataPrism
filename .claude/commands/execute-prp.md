# Execute Product Requirements Prompt (PRP) for DataPrism Core

You are an expert software engineer tasked with implementing features in DataPrism Core based on a comprehensive Product Requirements Prompt (PRP). Your goal is to deliver fully functional, tested, and documented code that meets all requirements.

## Your Mission

Read the PRP file provided in $ARGUMENTS and implement the feature according to the specifications. Follow the implementation plan, validate each step, and ensure all success criteria are met.

## Implementation Process

### Phase 1: Analysis and Planning

1. **Read the Complete PRP**: Understand all requirements, constraints, and success criteria
2. **Analyze Current Codebase**: Review existing patterns and integration points
3. **Create Implementation Plan**: Break down the work into manageable tasks
4. **Validate Dependencies**: Ensure all required tools and libraries are available

### Phase 2: Core Implementation

1. **Set Up Development Environment**: Prepare workspace and tools
2. **Implement Core Logic**: Write the main functionality following established patterns
3. **Add Error Handling**: Implement comprehensive error management
4. **Optimize Performance**: Ensure performance targets are met

### Phase 3: Integration and Testing

1. **Integration Testing**: Verify component interactions
2. **Performance Testing**: Validate performance requirements
3. **Browser Compatibility**: Test across supported browsers
4. **Error Scenario Testing**: Verify error handling works correctly

### Phase 4: Documentation and Validation

1. **Code Documentation**: Add comprehensive comments and documentation
2. **API Documentation**: Update API documentation if needed
3. **Example Code**: Create usage examples
4. **Final Validation**: Run all validation commands from the PRP

## DataPrism Core Implementation Guidelines

### WebAssembly Development

- Use proper wasm-bindgen patterns for JavaScript interop
- Implement efficient memory management
- Handle WebAssembly compilation correctly
- Optimize for browser memory constraints

### Rust Code Standards

```rust
// Follow these patterns for Rust code
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ComponentName {
    // Implementation details
}

#[wasm_bindgen]
impl ComponentName {
    #[wasm_bindgen(constructor)]
    pub fn new() -> ComponentName {
        // Initialization
    }

    #[wasm_bindgen]
    pub fn method_name(&self, param: &str) -> Result<String, JsValue> {
        // Implementation with proper error handling
    }
}
```

### TypeScript Code Standards

```typescript
// Follow these patterns for TypeScript code
export interface ComponentInterface {
  property: string;
  method(param: string): Promise<Result>;
}

export class ComponentClass implements ComponentInterface {
  constructor() {
    // Initialization
  }

  async method(param: string): Promise<Result> {
    // Implementation with proper error handling
  }
}
```

### DuckDB Integration Patterns

```typescript
// Follow these patterns for DuckDB integration
import * as duckdb from "@duckdb/duckdb-wasm";

export class DuckDBManager {
  private db: duckdb.AsyncDuckDB;

  async initialize(): Promise<void> {
    // Initialize DuckDB with proper error handling
  }

  async query(sql: string): Promise<QueryResult> {
    // Execute query with performance optimization
  }
}
```

### LLM Integration Patterns

```typescript
// Follow these patterns for LLM integration
export class LLMProvider {
  private cache: Map<string, CachedResult>;

  async query(prompt: string): Promise<LLMResult> {
    // Check cache first
    // Handle rate limiting
    // Implement retry logic
  }
}
```

## Testing Implementation

### Unit Tests

```rust
// Rust unit tests
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_component_functionality() {
        // Test implementation
    }
}
```

```typescript
// TypeScript unit tests
describe("ComponentName", () => {
  it("should perform expected functionality", async () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// Integration tests for cross-language interactions
describe("WASM Integration", () => {
  it("should handle data exchange correctly", async () => {
    // Test WebAssembly-JavaScript interop
  });
});
```

### Performance Tests

```typescript
// Performance benchmarks
describe("Performance", () => {
  it("should meet response time requirements", async () => {
    // Test performance targets
  });
});
```

## Validation Process

### Code Quality Checks

Run these commands to validate implementation:

```bash
# Rust code quality
cargo clippy
cargo fmt
cargo test

# TypeScript code quality
npm run lint
npm run type-check
npm test

# Build validation
npm run build
npm run build:core
wasm-pack build packages/core
```

### Performance Validation

```bash
# Performance benchmarks
npm run test:performance
npm run benchmark
```

### Browser Compatibility

```bash
# Browser compatibility tests
npm run test:browser
npm run test:integration
```

## Success Criteria Validation

### Functional Requirements

- [ ] All specified functionality implemented
- [ ] API contracts met
- [ ] Integration points working correctly
- [ ] Error handling comprehensive

### Performance Requirements

- [ ] Query response time <2 seconds (95% of operations)
- [ ] Memory usage <4GB for 1M row datasets
- [ ] Initialization time <5 seconds
- [ ] Browser compatibility verified

### Quality Requirements

- [ ] Unit test coverage >90%
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Code review ready

## Error Handling Strategy

### WebAssembly Errors

```rust
// Proper error handling in Rust
use wasm_bindgen::JsValue;

fn handle_error(error: &str) -> JsValue {
    JsValue::from_str(&format!("DataPrism Error: {}", error))
}
```

### TypeScript Errors

```typescript
// Proper error handling in TypeScript
export class DataPrismError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "DataPrismError";
  }
}
```

## Documentation Requirements

### Code Documentation

- TSDoc comments for all public TypeScript interfaces
- Rust documentation for all public functions
- Clear examples for complex functionality

### API Documentation

- Update API reference documentation
- Add usage examples
- Document performance characteristics

### README Updates

- Update component README files
- Add integration examples
- Document new configuration options

## Final Checklist

Before completing implementation:

- [ ] All PRP requirements implemented
- [ ] Code follows established patterns
- [ ] Tests written and passing
- [ ] Performance targets met
- [ ] Browser compatibility verified
- [ ] Documentation updated
- [ ] Error handling comprehensive
- [ ] Code review ready

## Completion Report

After implementation, provide:

1. **Summary of Changes**: What was implemented
2. **Testing Results**: All test outcomes
3. **Performance Metrics**: Benchmark results
4. **Documentation Updates**: What documentation was added/updated
5. **Known Limitations**: Any limitations or considerations
6. **Next Steps**: Recommendations for future improvements

Execute the PRP systematically, validate each step, and deliver production-ready code that meets all specifications.
