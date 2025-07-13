import { vi } from 'vitest';

// Mock DOM APIs
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Web Workers
global.Worker = vi.fn(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onmessage: null,
  onerror: null,
}));

// Mock File API
global.File = vi.fn();
global.FileReader = vi.fn(() => ({
  readAsArrayBuffer: vi.fn(),
  readAsText: vi.fn(),
  onload: null,
  onerror: null,
  result: null,
}));

// Mock Canvas API
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
  toBlob: vi.fn((callback) => callback(new Blob())),
}));

// Mock URL API
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock performance API
global.performance.mark = vi.fn();
global.performance.measure = vi.fn();
global.performance.getEntriesByName = vi.fn(() => []);

// Mock DataPrism plugins interfaces (since we don't have the actual package)
vi.mock('@dataprism/plugins', () => ({
  // Plugin interfaces would be mocked here
  IPlugin: class {},
  IVisualizationPlugin: class {},
  IIntegrationPlugin: class {},
  IDataProcessorPlugin: class {},
  IUtilityPlugin: class {},
}));

// Suppress console warnings during tests
global.console.warn = vi.fn();
global.console.error = vi.fn();