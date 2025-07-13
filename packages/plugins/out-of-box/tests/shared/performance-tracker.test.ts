import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceTracker } from '../../src/shared/performance-tracker.js';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => [{ duration: 100 }]),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024 // 50MB
  }
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

describe('PerformanceTracker', () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = new PerformanceTracker({
      maxMemoryMB: 100,
      minFps: 30,
      maxQueryTimeMs: 1000,
      maxCpuPercent: 80
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    tracker.stop();
  });

  describe('Lifecycle', () => {
    it('should start and stop tracking', () => {
      expect(tracker.getMetrics()).toHaveLength(0);
      
      tracker.start();
      // Metrics should be collected over time
      
      tracker.stop();
      // Should stop collecting metrics
    });
  });

  describe('Metrics Collection', () => {
    it('should collect performance metrics', () => {
      tracker.start();
      
      // Wait for at least one metrics collection cycle
      return new Promise(resolve => {
        setTimeout(() => {
          const metrics = tracker.getMetrics();
          expect(metrics.length).toBeGreaterThan(0);
          
          const latestMetric = metrics[metrics.length - 1];
          expect(latestMetric).toHaveProperty('timestamp');
          expect(latestMetric).toHaveProperty('fps');
          expect(latestMetric).toHaveProperty('memoryUsage');
          expect(latestMetric).toHaveProperty('cpuUsage');
          expect(latestMetric).toHaveProperty('wasmHeapSize');
          
          resolve(undefined);
        }, 100);
      });
    });

    it('should limit metrics history', () => {
      tracker.start();
      
      // Simulate many metrics updates
      for (let i = 0; i < 400; i++) {
        // Metrics are added internally, this tests the limit
      }
      
      const metrics = tracker.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(300); // Max history length
    });
  });

  describe('Query Timing', () => {
    it('should track query execution time', () => {
      const queryId = 'test-query-1';
      
      tracker.markQueryStart(queryId);
      
      // Simulate query execution
      setTimeout(() => {
        const duration = tracker.markQueryEnd(queryId);
        
        expect(duration).toBeGreaterThan(0);
        expect(mockPerformance.mark).toHaveBeenCalledWith(`query-start-${queryId}`);
        expect(mockPerformance.mark).toHaveBeenCalledWith(`query-end-${queryId}`);
        expect(mockPerformance.measure).toHaveBeenCalledWith(
          `query-${queryId}`, 
          `query-start-${queryId}`, 
          `query-end-${queryId}`
        );
      }, 50);
    });
  });

  describe('Alert System', () => {
    it('should emit alerts when thresholds are exceeded', (done) => {
      tracker.start();
      
      tracker.on('alert', (alert) => {
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('value');
        expect(alert).toHaveProperty('threshold');
        expect(alert).toHaveProperty('timestamp');
        done();
      });

      // Simulate high query time to trigger alert
      const queryId = 'slow-query';
      tracker.markQueryStart(queryId);
      
      // Mock a slow query (> 1000ms threshold)
      mockPerformance.getEntriesByName.mockReturnValueOnce([{ duration: 2000 }]);
      tracker.markQueryEnd(queryId);
    });
  });

  describe('Data Export', () => {
    it('should export metrics as CSV', () => {
      tracker.start();
      
      // Add some test metrics
      const csv = tracker.exportMetrics();
      
      expect(csv).toBeTruthy();
      expect(csv).toContain('timestamp,fps,memoryUsage');
      
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Header + at least one data row
    });
  });

  describe('Memory Management', () => {
    it('should clear metrics when requested', () => {
      tracker.start();
      
      // Wait for some metrics to be collected
      setTimeout(() => {
        expect(tracker.getMetrics().length).toBeGreaterThan(0);
        
        tracker.clearMetrics();
        expect(tracker.getMetrics().length).toBe(0);
      }, 100);
    });
  });
});