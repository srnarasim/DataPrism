/**
 * Test Retry Mechanism for DataPrism CI/CD Robustness
 * Provides exponential backoff retry logic for flaky tests
 */

export interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  backoffFactor: number;
  timeout?: number;
  retryCondition?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  result: T;
  attempts: number;
  totalTime: number;
  errors: Error[];
}

export class TestRetryManager {
  private static readonly DEFAULT_OPTIONS: RetryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffFactor: 2,
    timeout: 30000,
    retryCondition: (error) => true // Retry all errors by default
  };

  /**
   * Runs a test function with retry logic and exponential backoff
   */
  async runWithRetry<T>(
    testFn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config = { ...TestRetryManager.DEFAULT_OPTIONS, ...options };
    const errors: Error[] = [];
    const startTime = Date.now();
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await this.runWithTimeout(testFn, config.timeout);
        
        if (attempt > 0) {
          console.log(`✅ Test succeeded on attempt ${attempt + 1}/${config.maxRetries + 1}`);
        }
        
        return result;
      } catch (error) {
        const testError = error instanceof Error ? error : new Error(String(error));
        errors.push(testError);
        
        console.warn(`❌ Test attempt ${attempt + 1}/${config.maxRetries + 1} failed:`, testError.message);
        
        // Check if we should retry this error
        if (!config.retryCondition!(testError)) {
          console.log('🚫 Error type is not retryable, failing immediately');
          throw testError;
        }
        
        // If this is the last attempt, throw the accumulated errors
        if (attempt >= config.maxRetries) {
          const totalTime = Date.now() - startTime;
          throw new RetryExhaustedError(errors, attempt + 1, totalTime);
        }
        
        // Calculate delay with exponential backoff
        const delay = config.retryDelay * Math.pow(config.backoffFactor, attempt);
        console.log(`⏳ Retrying in ${delay}ms... (attempt ${attempt + 2}/${config.maxRetries + 1})`);
        
        await this.sleep(delay);
      }
    }
    
    // This should never be reached due to the logic above
    throw new Error('Unexpected retry loop exit');
  }

  /**
   * Runs a function with a timeout
   */
  private async runWithTimeout<T>(fn: () => Promise<T>, timeoutMs?: number): Promise<T> {
    if (!timeoutMs) {
      return await fn();
    }
    
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      fn()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates retry options for different test scenarios
   */
  static createRetryOptions(scenario: 'browser' | 'network' | 'wasm' | 'integration'): RetryOptions {
    switch (scenario) {
      case 'browser':
        return {
          maxRetries: 3,
          retryDelay: 2000,
          backoffFactor: 1.5,
          timeout: 30000,
          retryCondition: (error) => {
            // Retry on common browser test failures
            const retryableErrors = [
              'timeout',
              'navigation',
              'network',
              'element not found',
              'stale element',
              'detached',
              'connection'
            ];
            return retryableErrors.some(pattern => 
              error.message.toLowerCase().includes(pattern)
            );
          }
        };
        
      case 'network':
        return {
          maxRetries: 5,
          retryDelay: 1000,
          backoffFactor: 2,
          timeout: 15000,
          retryCondition: (error) => {
            // Retry on network-related errors
            const retryableErrors = [
              'ECONNRESET',
              'ENOTFOUND',
              'ECONNREFUSED',
              'timeout',
              'fetch failed',
              'network',
              '503',
              '502',
              '504'
            ];
            return retryableErrors.some(pattern => 
              error.message.toLowerCase().includes(pattern)
            );
          }
        };
        
      case 'wasm':
        return {
          maxRetries: 3,
          retryDelay: 1500,
          backoffFactor: 2,
          timeout: 20000,
          retryCondition: (error) => {
            // Retry on WASM-related errors
            const retryableErrors = [
              'wasm',
              'compilation',
              'instantiation',
              'memory',
              'module',
              'streaming'
            ];
            return retryableErrors.some(pattern => 
              error.message.toLowerCase().includes(pattern)
            );
          }
        };
        
      case 'integration':
        return {
          maxRetries: 4,
          retryDelay: 2500,
          backoffFactor: 1.8,
          timeout: 45000,
          retryCondition: (error) => {
            // Retry on integration test failures
            const nonRetryableErrors = [
              'assertion',
              'expect',
              'syntax',
              'reference',
              'type'
            ];
            return !nonRetryableErrors.some(pattern => 
              error.message.toLowerCase().includes(pattern)
            );
          }
        };
        
      default:
        return TestRetryManager.DEFAULT_OPTIONS;
    }
  }
}

/**
 * Error thrown when all retry attempts are exhausted
 */
export class RetryExhaustedError extends Error {
  constructor(
    public readonly errors: Error[],
    public readonly attempts: number,
    public readonly totalTime: number
  ) {
    const lastError = errors[errors.length - 1];
    super(`Test failed after ${attempts} attempts (${totalTime}ms total): ${lastError?.message || 'Unknown error'}`);
    this.name = 'RetryExhaustedError';
    
    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RetryExhaustedError);
    }
  }
  
  /**
   * Get a summary of all errors that occurred
   */
  getErrorSummary(): string {
    return this.errors.map((error, index) => 
      `Attempt ${index + 1}: ${error.message}`
    ).join('\n');
  }
}

/**
 * Error thrown when an operation times out
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
}

/**
 * Decorator for automatically retrying test functions
 */
export function withRetry(options: Partial<RetryOptions> = {}) {
  return function <T extends any[], R>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const originalMethod = descriptor.value!;
    const retryManager = new TestRetryManager();
    
    descriptor.value = async function (...args: T): Promise<R> {
      return retryManager.runWithRetry(
        () => originalMethod.apply(this, args),
        options
      );
    };
    
    return descriptor;
  };
}

/**
 * Utility function for creating retryable test cases
 */
export function retryableTest<T>(
  testFn: () => Promise<T>,
  scenario: 'browser' | 'network' | 'wasm' | 'integration' = 'integration'
): Promise<T> {
  const retryManager = new TestRetryManager();
  const options = TestRetryManager.createRetryOptions(scenario);
  
  return retryManager.runWithRetry(testFn, options);
}