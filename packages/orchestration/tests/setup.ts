// Test setup file for Vitest
import { beforeAll, afterAll } from "vitest";

// Mock performance.memory for testing
Object.defineProperty(performance, "memory", {
  value: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    totalJSHeapSize: 1024 * 1024 * 50, // 50MB
    jsHeapSizeLimit: 1024 * 1024 * 1024, // 1GB
  },
  writable: true,
});

// Global test setup
beforeAll(() => {
  console.log("Setting up DataPrism Core tests...");
});

afterAll(() => {
  console.log("Cleaning up DataPrism Core tests...");
});

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  // Only show errors that aren't expected test errors
  if (!args[0]?.includes?.("DataPrism Error")) {
    originalError(...args);
  }
};

console.warn = (...args: any[]) => {
  // Only show warnings that aren't expected test warnings
  if (!args[0]?.includes?.("WASM module not available")) {
    originalWarn(...args);
  }
};
